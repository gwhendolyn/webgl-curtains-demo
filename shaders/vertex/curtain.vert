precision mediump float;
// those are the mandatory attributes that the lib sets
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
//model view and projection matrix
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
//texture matrix that will handle image cover
uniform mat4 planeTextureMatrix;
// pass vertex and texture coords to the fragment shader
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
uniform float uTime;
void main() {
    vec3 vertexPosition = aVertexPosition;
    vertexPosition.z = (-vertexPosition.y+1.0) * 0.005 * sin(vertexPosition.x*10.0  + uTime*0.03);
    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
    
    vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vVertexPosition = vertexPosition;
}