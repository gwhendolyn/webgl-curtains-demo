precision mediump float;
// those are the mandatory attributes that the lib sets
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
//model view and projection matrix
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
//texture matrix that will handle image cover
uniform mat4 uTextureMatrix0;
uniform float uTime;
// pass vertex and texture coords to the fragment shader
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying float vHeight;

void main() {
    vec3 vertexPosition = aVertexPosition;
    vertexPosition.z = 0.03 * sin(length(vertexPosition.xy) * 8.0 - uTime * 0.03);
    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
    // set the varyings
    // here we use our texture matrix to calculate the accurate texture coords
    vTextureCoord = (uTextureMatrix0 * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vVertexPosition = vertexPosition;
    vHeight = vertexPosition.z;
}