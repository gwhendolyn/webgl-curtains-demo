precision mediump float;
// get our varyings
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

// our texture sampler (default name, to use a different name please refer to the documentation)
uniform sampler2D planeTexture;
void main() {
    gl_FragColor = texture2D(planeTexture, vTextureCoord);
}