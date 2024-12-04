#version 100
#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uTilesMatrix;
uniform float uTime;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec3 vSurfaceNormal;
varying float vCaustic;

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

#define OCTAVES 12.0
void main(){
    vec3 vertexPosition = aVertexPosition;
    vec2 samplePos = vertexPosition.xy;
    vec2 directionVector = vec2(0.0);
    float amplitude = 0.008;
    float wavelength = 0.15;
    float speed = 0.03;
    float partialDer = 0.0;
    vec3 binormal = vec3(1.0,0.0,0.0);
    vec3 tangent = vec3(0.0,1.0,0.0);

    for(float i = 1.0; i < OCTAVES+1.0; i++){
        //generate random direction vector
        directionVector.x = (random(vec2(i*1.3,i+1.2))-0.5)*2.0;
        directionVector.y = (random(vec2(i+1.11,i*1.5))-0.5)*2.0;
        directionVector = normalize(directionVector);
        
        //calculate wave height contribution and add to vertex z coord
        float val = amplitude * sin(dot(directionVector, samplePos) * (2.0/wavelength) + uTime * speed);
        vertexPosition.z += val;
        
        //calculate partial derivative and add to binormal and tangent z components
        partialDer = -amplitude * cos(dot(directionVector, samplePos) * (2.0/wavelength) + uTime * speed);
        binormal.z += directionVector.x * partialDer;
        tangent.z += directionVector.y * partialDer;
        
        
        //adjust params
        amplitude *= 0.85;
        wavelength *= 0.85;
        samplePos.x += partialDer * directionVector.x;
        samplePos.y += partialDer * directionVector.y;
        speed *= 1.02;
    }

    vSurfaceNormal = cross(binormal, tangent);
    
    
    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0); 
    vTextureCoord = (uTilesMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vVertexPosition = vertexPosition;
}