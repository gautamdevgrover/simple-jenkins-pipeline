pipeline {
  agent none

  environment {
    REGISTRY = "gautamdevgrover"
    IMAGE = "simple-webserver"
  }

  stages {
    stage('Checking out repo on master-node)') {
      agent { label 'master-node' }    // optional — keeps a record, not needed for build
      steps {
        checkout scm
        echo "Checked out on master-node."
      }
    }

    stage('Checking out repo on worker-node') {
      agent { label 'worker-node' }
      steps {
        checkout scm
        echo "Checked out on worker-node."
      }
    }   
    stage('Build Docker Image on worker-node') {
      agent { label 'worker-node' }    // <-- the worker node label (must match your node label)
      steps {
        
        sh '''
          echo "Building Docker image on worker..."
          docker build -t ${REGISTRY}/${IMAGE}:${BUILD_NUMBER} .
        '''
      }
    }

    stage('Docker Login & Push') {
      agent { label 'worker-node' }    // can run on worker too (it has docker)
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push ${REGISTRY}/${IMAGE}:${BUILD_NUMBER}
          '''
        }
      }
    }

    stage('Deploy on EC2') {
      agent { label 'worker-node' }    // run deploy from master (or any node with ssh & key)
      steps {
        sshagent (credentials: ['jenkins-agent-key']) {
          sh '''
            IMAGE="${REGISTRY}/${IMAGE}:${BUILD_NUMBER}"
            ssh -o StrictHostKeyChecking=no ubuntu@13.203.222.127 <<EOF
              set -ex
              docker pull "$IMAGE"
              docker stop simple-webserver-container || true
              docker rm simple-webserver-container || true
              docker run -d -p 80:80 --name simple-webserver-container "$IMAGE"
EOF
          '''
        }
      }
    }
  }

  post {
    success {
      emailext (
        subject: "SUCCESS: ${JOB_NAME} #${BUILD_NUMBER}",
        body: """<p>Good news — build succeeded.</p>
                <b>Job:</b> ${JOB_NAME}<br/>
                <b>Build:</b> <a href="${BUILD_URL}">#${BUILD_NUMBER}</a><br/>
                <b>Node:</b> ${NODE_NAME}<br/>
                <pre>${CHANGES_SINCE_LAST_SUCCESS, format="JSON"}</pre>""",
        to: "gautam.dev@unthinkable.co",
        mimeType: 'text/html'
      )
    }
    failure {
      emailext (
        subject: "FAILURE: ${JOB_NAME} #${BUILD_NUMBER}",
        body: """<p>Build failed — please check.</p>
                <b>Job:</b> ${JOB_NAME}<br/>
                <b>Build:</b> <a href="${BUILD_URL}">#${BUILD_NUMBER}</a><br/>
                <b>Node:</b> ${NODE_NAME}<br/>
                <p>Console output is attached.</p>""",
        to: "gautam.dev@unthinkable.co",
        mimeType: 'text/html',
        attachLog: true,        // attach console log to help debugging
        compressLog: true       // compress attachment (optional)
      )
    }
    always {
      echo "Pipeline finished (success or failure)."
    }
  }
