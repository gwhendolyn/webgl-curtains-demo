#version 100
#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uTextureMatrix0;
uniform float uTime;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

void main() {
    vec3 vertexPosition = aVertexPosition;
    //vertexPosition.z = 0.07 * sin(min((vertexPosition.x-0.5) + (uTime/11.25),1.0)*(uTime/45.0))+0.01;
    vertexPosition.z = 0.07 * sin(clamp((vertexPosition.x-1.0)+uTime/10.0,0.0,2.0));
    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
    vTextureCoord = (uTextureMatrix0 * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vVertexPosition = vertexPosition;
}