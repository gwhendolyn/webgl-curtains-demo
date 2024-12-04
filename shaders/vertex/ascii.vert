#version 100
#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

uniform mat4 charSpriteSheetMatrix;

void main(){
    gl_Position = vec4(aVertexPosition, 1.0);

    vTextureCoord = aTextureCoord;
    vVertexPosition = aVertexPosition;
}