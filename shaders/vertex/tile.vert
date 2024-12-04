#version 100
#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

uniform mat4 uColorMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uRoughnessMatrix;

void main(){
    vec3 vertexPosition = aVertexPosition;
    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition,1.0);

    vTextureCoord = (uColorMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vVertexPosition = vertexPosition;
}