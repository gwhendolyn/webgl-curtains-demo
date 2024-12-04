precision mediump float;
// get our varyings
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

// our texture sampler (default name, to use a different name please refer to the documentation)
uniform sampler2D planeTexture;
uniform float uTime;
void main() {
    vec4 sample = texture2D(planeTexture, vTextureCoord);
    float highLight = (1.0 - vTextureCoord.y) * 0.005 * sin((vTextureCoord.x-0.5)*20.0  + uTime*0.03);
    vec3 bgColor = vec3(0.7568627450980,
                        0.0705882352941,
                        0.1215686274509);
    sample.rgb = mix(sample.rgb, bgColor, 1.0 - sample.a);
    sample.rgb += highLight * 40.0;
    gl_FragColor = vec4(sample.rgb, 1.0);
}