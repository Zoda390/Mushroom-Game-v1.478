#ifdef GL_ES
precision mediump float;
#endif

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform vec2 u_resolution;
uniform float res;

void main() {
  vec2 uv = vTexCoord;
  
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;
  
  vec4 tex = texture2D(tex0, uv);
  
  gl_FragColor = vec4(texture2D(tex0, vec2(floor(uv.x/(1.0/res)) * (1.0/res),floor(uv.y/(1.0/res)) * (1.0/res))));

  // render the output
  
}