'use server'
import fs from 'fs';
import path from 'path';
import { encrypt } from './encryption.js'; // 암호화 함수 import
import pkg from '@next/env'; // CommonJS 방식으로 모듈 가져오기
const { loadEnvConfig } = pkg;


// .env에서 암호화 키 로드
const { NEXT_PUBLIC_ENCRYPTION_KEY } = loadEnvConfig(process.cwd()).combinedEnv;

// JSON 파일을 암호화하고 저장하는 함수
async function encryptAndSaveJSON(filePath) {
    try {
        // JSON 파일 읽기
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        // JSON 파일 암호화
        const encryptedData = encrypt(JSON.stringify(jsonData), NEXT_PUBLIC_ENCRYPTION_KEY);

        // 암호화된 데이터를 저장할 파일 경로
        const encryptedFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, '.json')}.enc`);

        // 암호화된 데이터를 파일로 저장
        fs.writeFileSync(encryptedFilePath, encryptedData, 'utf-8');

        console.log(`Encrypted JSON saved to: ${encryptedFilePath}`);
    } catch (error) {
        console.error(`Failed to encrypt and save JSON: ${error.message}`);
    }
}

// 예시 사용
const publicDir = './public'; // public 디렉토리 경로
const jsonFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.json'));

jsonFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    encryptAndSaveJSON(filePath);
});
