#version 100
#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec3 vSurfaceNormal;
varying float vCaustic;
uniform vec3 uLight;
uniform float uTime;


#define IOR 1.33
void main(){
    //getting required vectors for lighting
    mat3 rotate = mat3(1.0, 0.0       , 0.0,
                        0.0, cos(1.308996939), -sin(1.308996939),
                        0.0, sin(1.308996939), cos(1.308996939));
    
    vec3 view  = normalize(vec3(0.0,1.0,0.26795)+vVertexPosition) * rotate;
    vec3 norm  = normalize(vSurfaceNormal * rotate);
    vec3 light = normalize(uLight) * rotate;
    vec3 halfA = normalize(view+light);
    //calculating lighting terms
    vec3 ambient = 0.01 * vec3(3.0/255.0, 4.0/255.0, 94.0/255.0);
    vec3 diffuse  = max(0.0, dot(light, norm)) * vec3(173.0/255.0, 232.0/255.0, 244.0/255.0);
    vec3 specular = pow((1.0-dot(view,norm)),5.0) * max(0.0, pow(dot(norm, halfA), 4.0)) * vec3(253.0/255.0,252.0/255.0,220.0/255.0);
    //outputting final color
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}