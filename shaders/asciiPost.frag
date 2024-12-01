#version 100
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D uRenderTexture;
uniform sampler2D charSpriteSheet;

void main(){
    
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    vec2 charUv = fract(uv * vec2(u_resolution.x/8.0,u_resolution.y/8.0));
    float gScale = texture2D(uRenderTexture,uv,3.0).x;
    charUv.x = (floor(gScale * 8.0) + charUv.x) / 7.0;
    gl_FragColor = vec4(texture2D(charSpriteSheet,charUv));
}