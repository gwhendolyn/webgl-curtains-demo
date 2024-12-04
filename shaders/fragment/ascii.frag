#version 100
#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

uniform vec2 uRes;
uniform sampler2D uRenderTexture;
uniform sampler2D charSpriteSheet;

void main(){
    //get local position within tile
    vec2 charUv = fract(vTextureCoord * vec2(uRes.x/8.0,uRes.y/8.0));
    
    //get texture sample at bottom left corner of tile
    float dx = 8.0 / uRes.x;
    float dy = 8.0 / uRes.y;
    vec2 gCoord = vec2(dx * floor(vTextureCoord.x / dx),
                        dy * floor(vTextureCoord.y / dy));
    vec4 texSample = texture2D(uRenderTexture,gCoord);
    
    //separate luminance
    float luma = texSample.r*0.2126 + texSample.g*0.7152 +texSample.b*0.0722;
    //select character and by quantized luminance
    charUv.x = (floor(luma * 9.99) + charUv.x) / 10.0;
    vec4 charSample = texture2D(charSpriteSheet,charUv);
    
    //separate chromaticity
    float sum = texSample.r + texSample.g + texSample.b;
    vec3 chroma = vec3(texSample.r/sum, texSample.g/sum, texSample.b/sum);
    //tint character towards chromaticity (bias towards white)
    charSample.rgb = charSample.rgb * (chroma*2.4);

    //set alpha channel from full render
    charSample.a = texture2D(uRenderTexture,vTextureCoord).a;

    //output final color
    gl_FragColor = charSample;
}