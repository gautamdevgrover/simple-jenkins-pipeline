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

    stage('install git if its not installed') {
      agent { label 'worker-node' }    
      steps {
        sh '''
          sudo apt install git -y
        '''
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
    success { echo "Pipeline completed successfully." }
    failure { echo "Pipeline failed." }
  }
}
