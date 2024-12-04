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
uniform float u_time;
uniform int u_mouseover;
void main() {
    vec3 vertexPosition = aVertexPosition;
    
    if (u_mouseover == 1){
        vertexPosition.z = sin(vertexPosition.x + u_time*2.0)*0.05;
    }

    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
    // set the varyings
    // here we use our texture matrix to calculate the accurate texture coords
    vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vVertexPosition = vertexPosition;
}