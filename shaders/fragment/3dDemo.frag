precision mediump float;
// get our varyings
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying float vHeight;

// our texture sampler (default name, to use a different name please refer to the documentation)
uniform sampler2D uSampler0;
void main() {
    vec4 sample = texture2D(uSampler0, vTextureCoord);
    sample.rgb *= vHeight*20.0+1.0;
    gl_FragColor = sample;
}