// Jenkinsfile (전체 수정본)

pipeline {
    agent any // 파이프라인을 실행할 Jenkins 에이전트 지정

    environment {
        DOCKERHUB_USERNAME = 'yhcho14' // 본인의 Docker Hub 사용자 이름으로 변경
        BACKEND_APP_NAME = 'beanbuddies-matching-platform'
        FRONTEND_APP_NAME = 'beanbuddies-frontend'
        // 프런트엔드 빌드 시 사용할 API 엔드포인트 (Vite는 VITE_ 접두사만 클라이언트에 노출)
        // 브랜치/스테이지에 따라 값 변경 가능. 필요시 Jenkins 전역 env/폴더별 env로 override
        VITE_API_BASE_URL = 'https://api.yhcho.com'
    }

    tools {
        nodejs 'NodeJS-24'
    }

    stages {
        stage('Checkout') {
            steps {
                // 체크아웃
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    // Vite는 빌드 타임에 VITE_ 변수를 번들에 인라인합니다.
                    sh 'VITE_API_BASE_URL=${VITE_API_BASE_URL} npm run build'
                }
            }
        }

        stage('Build & Push Frontend Docker Image') {
            // main 브랜치에 푸시될 때만 실행
            when {
                branch 'main'
            }
            steps {
                script {
                    // Docker 이미지 빌드 시에도 build-arg로 전달하여 Dockerfile ARG -> ENV로 주입
                    def appImage = docker.build("${DOCKERHUB_USERNAME}/${FRONTEND_APP_NAME}:${env.BUILD_NUMBER}", "--build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} ./frontend")
                    docker.withRegistry('https://registry.hub.docker.com', 'yhcho-dockerhub') {
                        appImage.push()
                    }
                }
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('backend') {
                    sh 'chmod +x gradlew'
                    // main 브랜치가 아닐 경우 테스트를 포함하여 빌드하고, main 브랜치일 경우 테스트를 제외하고 빌드합니다.
                    script {
                        if (env.BRANCH_NAME != 'main') {
                            sh './gradlew clean build'
                        } else {
                            sh './gradlew clean build -x test'
                        }
                    }
                }
            }
        }

        stage('Build & Push Backend Docker Image') {
            // main 브랜치에 푸시될 때만 실행
            when {
                branch 'main'
            }
            steps {
                script {
                    def appImage = docker.build("${DOCKERHUB_USERNAME}/${BACKEND_APP_NAME}:${env.BUILD_NUMBER}", './backend')
                    docker.withRegistry('https://registry.hub.docker.com', 'yhcho-dockerhub') {
                        appImage.push()
                    }
                }
            }
        }

        stage('Deploy Backend') {
            // main 브랜치에 푸시될 때만 실행
            when {
                branch 'main'
            }
            steps {
                withCredentials([
                    string(credentialsId: 'your-db-host', variable: 'DB_URL_SECRET'),
                    string(credentialsId: 'db-username', variable: 'DB_USERNAME_SECRET'),
                    string(credentialsId: 'db-password', variable: 'DB_PASSWORD_SECRET'),
                    string(credentialsId: 'jwt-secret-key', variable: 'JWT_ACCESS_KEY_SECRET'),
                    string(credentialsId: 'jwt-refresh-key', variable: 'JWT_REFRESH_KEY_SECRET'),
                    string(credentialsId: 'redis-host', variable: 'REDIS_HOST_SECRET'),
                    string(credentialsId: 'redis-port', variable: 'REDIS_PORT_SECRET'),
                    string(credentialsId: 'redis-password', variable: 'REDIS_PASSWORD_SECRET'),
                    string(credentialsId: 'mail-username', variable: 'MAIL_USERNAME_SECRET'),
                    string(credentialsId: 'mail-password', variable: 'MAIL_PASSWORD_SECRET')
                ]) {
                    sshagent(['yhcho-ssh']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no yhcho@192.168.50.35 /bin/bash << EOF

                                echo "Deploying backend build number: ${env.BUILD_NUMBER}"

                                docker stop ${BACKEND_APP_NAME} || true && docker rm ${BACKEND_APP_NAME} || true
                                docker pull ${DOCKERHUB_USERNAME}/${BACKEND_APP_NAME}:${env.BUILD_NUMBER}
                                docker run -d --name ${BACKEND_APP_NAME} -p 8080:8080 \
                                    --add-host=host.docker.internal:host-gateway \
                                    -e SPRING_PROFILES_ACTIVE=prod \
                                    -e SPRING_DATASOURCE_URL='${DB_URL_SECRET}' \
                                    -e SPRING_DATASOURCE_USERNAME='${DB_USERNAME_SECRET}' \
                                    -e SPRING_DATASOURCE_PASSWORD='${DB_PASSWORD_SECRET}' \
                                    -e CUSTOM_JWT_ACCESSTOKEN_SECRETKEY='${JWT_ACCESS_KEY_SECRET}' \
                                    -e CUSTOM_JWT_ACCESSTOKEN_EXPIRESECONDS=3600 \
                                    -e CUSTOM_JWT_REFRESHTOKEN_SECRETKEY='${JWT_REFRESH_KEY_SECRET}' \
                                    -e CUSTOM_JWT_REFRESHTOKEN_EXPIRESECONDS=604800 \
                                    -e SPRING_DATA_REDIS_HOST='${REDIS_HOST_SECRET}' \
                                    -e SPRING_DATA_REDIS_PORT='${REDIS_PORT_SECRET}' \
                                    -e SPRING_DATA_REDIS_PASSWORD='${REDIS_PASSWORD_SECRET}' \
                                    -e SPRING_MAIL_HOST=smtp.gmail.com \
                                    -e SPRING_MAIL_PORT=587 \
                                    -e SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true \
                                    -e SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true \
                                    -e SPRING_MAIL_USERNAME='${MAIL_USERNAME_SECRET}' \
                                    -e SPRING_MAIL_PASSWORD='${MAIL_PASSWORD_SECRET}' \
                                    ${DOCKERHUB_USERNAME}/${BACKEND_APP_NAME}:${env.BUILD_NUMBER}
                                echo "Backend deploy complete"
EOF
                        """
                    }
                }
            }
        }

        stage('Deploy Frontend') {
            // main 브랜치에 푸시될 때만 실행
            when {
                branch 'main'
            }
            steps {
                sshagent(['yhcho-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no yhcho@192.168.50.35 /bin/bash << EOF

                            echo "Deploying frontend build number: ${env.BUILD_NUMBER}"

                            docker stop ${FRONTEND_APP_NAME} || true && docker rm ${FRONTEND_APP_NAME} || true
                            docker pull ${DOCKERHUB_USERNAME}/${FRONTEND_APP_NAME}:${env.BUILD_NUMBER}
                            docker run -d --name ${FRONTEND_APP_NAME} -p 3000:80 ${DOCKERHUB_USERNAME}/${FRONTEND_APP_NAME}:${env.BUILD_NUMBER}

                            echo "Frontend deploy complete"
EOF
                    """
                }
            }
        }
    }
    post {
        always {
            // 빌드 중간 산물들을 정리합니다.
            cleanWs()
        }
    }
}
