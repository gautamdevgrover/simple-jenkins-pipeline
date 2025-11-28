pipeline {
  agent any

  environment {
    REGISTRY = "gautamdevgrover"          // your Docker Hub username
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
        // Use SSH Username with private key credential in Jenkins (id: jenkins-agent-key)
        sshagent (credentials: ['jenkins-agent-key']) {
          sh '''
            echo "Deploying container on EC2..."

            ssh -o StrictHostKeyChecking=no ubuntu@13.203.222.127 << 'EOF'
              set -e
              IMAGE="${REGISTRY}/${IMAGE}:${BUILD_NUMBER}"

              echo "Pulling image: $IMAGE"
              docker pull "$IMAGE"

              echo "Stopping existing container (if any)..."
              docker stop todo-app || true
              docker rm todo-app || true

              echo "Running new container..."
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
