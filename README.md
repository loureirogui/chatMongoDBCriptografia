# chatMongoDBCriptografia
Pequeno projeto de chat node.js com armazenamento de mensagens em banco mongodb com criptografia aes

necessário criar arquivo .env com 
MONGODB_CONNECTION_STRING=seu caminho do banco mongodb
ENCRYPTION_KEY=chave de criptografia gerada pelo geradorSecretKey

e instalar as dependencias com 
npm install dotenv express mongoose mongodb socket.io
