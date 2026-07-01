@echo off
REM AI Job Copilot - Environment Setup
REM Run this before building the backend

set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot
set MAVEN_HOME=C:\Users\Shadow\Tools\apache-maven-3.9.9
set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%

echo Java version:
java -version
echo.
echo Maven version:
mvn -version
