#version 100
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 6

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 1.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

#define TIME_SCALE 0.065
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    
    vec2 ms = u_mouse.xy/u_resolution.xy;
    ms.x *= u_resolution.x/u_resolution.y;
    float mouseProx = sqrt(pow(st.x-ms.x,2.0)+pow(st.y-ms.y,2.0));

    vec2 q = vec2(0.0);
    q.x = fbm(6.*st+u_time*(TIME_SCALE+0.015));
    q.y = fbm(6.*st+u_time*(TIME_SCALE+0.015));

    vec2 r = vec2(0.0);
    r.x = fbm((abs(mouseProx)*1.)*st + q+u_time*(TIME_SCALE+0.01));
    r.y = fbm((abs(mouseProx)*1.)*st + q+u_time*(TIME_SCALE+0.01));

    vec2 s = vec2(0.0);
    s.x = fbm(5.0*st + r+u_time*(TIME_SCALE+0.005));
    s.y = fbm(5.0*st + r+u_time*(TIME_SCALE+0.005));

    float t = fbm(st+s);

    vec3 color = vec3(t);
    
    color = mix(vec3(0.4392156862745098, 0.8392156862745098, 1.0),
                vec3(0.4392156862745098, 0.8392156862745098, 1.0),
                clamp(((t*t)*4.0),0.0,1.0));
    
    color = mix(color,
                vec3(1.0, 0.4392156862745098, 0.6509803921568627),
                clamp(length(q.x)-1.0,0.0,1.0));
    
    color = mix(color,
                vec3(1.0, 0.592156862745098, 0.4392156862745098),
                clamp(length(r.x)-0.8,0.0,1.0));
    
    color = mix(color,
                vec3(1.0, 0.8392156862745098, 0.4392156862745098),
                clamp(length(s.x)-1.2,0.0,1.0));
    
    gl_FragColor = vec4(color,1.0);
}