#!/bin/sh

# 프로젝트의 루트로 이동
cd ../

# output 디렉토리 생성
mkdir -p output

# FE 디렉토리의 모든 파일을 output 폴더로 복사
cp -R ./FE/* ./output

# output 디렉토리 전체를 FE 폴더로 다시 복사 (목적지에 맞게 수정)
cp -R ./output/* ./FE/
