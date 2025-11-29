pipeline {
  agent any

  environment {
    REGISTRY = "gautamdevgrover"
    IMAGE = "demo-cicd"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          echo "Building Docker image..."
          docker build -t ${REGISTRY}/${IMAGE}:${BUILD_NUMBER} .
        '''
      }
    }

    stage('Docker Login & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "Logging in to Docker Hub..."
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

            IMAGE_TO_PUSH="${REGISTRY}/${IMAGE}:${BUILD_NUMBER}"
            echo "Pushing ${IMAGE_TO_PUSH} ..."
            docker push "$IMAGE_TO_PUSH"
          '''
        }
      }
    }

    stage('Deploy on EC2') {
      steps {
        sshagent (credentials: ['ubuntu]) {
          sh '''
            echo "Deploying container on EC2 from node: ${NODE_NAME}"
            IMAGE="${REGISTRY}/${IMAGE}:${BUILD_NUMBER}"
            echo "Will deploy image: $IMAGE"

            which ssh || { echo "ssh not found on this node"; exit 2; }
            ssh-add -l || true

            ssh -o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=no ubuntu@13.203.222.127 'echo REMOTE_OK || true'

            ssh -o StrictHostKeyChecking=no ubuntu@13.203.222.127 <<EOF
              set -ex
              echo "Remote: pulling $IMAGE"
              docker pull "$IMAGE"
              docker stop todo-app || true
              docker rm todo-app || true
              docker run -d -p 80:80 --name todo-app "$IMAGE"
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
