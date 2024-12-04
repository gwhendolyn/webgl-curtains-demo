precision mediump float;
// get our varyings
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

// our texture sampler (default name, to use a different name please refer to the documentation)
uniform sampler2D planeTexture;
uniform float u_time;
void main() {
    vec4 sample = texture2D(planeTexture, vTextureCoord);
    float phase = (u_time/4.0)+vTextureCoord.x*3.0;
    sample.rgb = sample.rgb * ((sin(phase)*0.5)+0.7) * vec3(0.7,1.0,1.0);
    gl_FragColor = sample;
}