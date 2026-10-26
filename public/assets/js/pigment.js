/* ==================================================================
   PIGMENT: the hero is an Yves Klein monochrome rendered as powdery
   pigment. The pointer pushes and smears it; the trail settles back
   slowly. Raw WebGL, one fragment shader, no library.

   Cost control: renders only while the hero is on screen and the tab
   is visible, DPR capped at 1.5, skipped entirely on low-power
   devices. With reduced motion, a single still frame is painted.
   ================================================================== */
window.Pigment = (function () {
  "use strict";

  var TRAIL = 16;

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform vec3 uTrail[" + TRAIL + "];",
    "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
    "  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}",
    "float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);",
    "  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/uRes;",
    "  float asp=uRes.x/uRes.y;",
    "  vec2 p=vec2(uv.x*asp,uv.y);",
    "  vec2 disp=vec2(0.);float push=0.;",
    "  for(int i=0;i<" + TRAIL + ";i++){",
    "    vec3 tr=uTrail[i];",
    "    if(tr.z<=0.001) continue;",
    "    vec2 d=p-vec2(tr.x*asp,tr.y);",
    "    float r2=dot(d,d);",
    "    float f=exp(-r2/0.018)*tr.z;",
    "    disp+=d*f*1.6;",
    "    push+=f;",
    "  }",
    "  vec2 q=p-disp;",
    "  float t=uTime*0.035;",
    "  float n=fbm(q*1.9+vec2(t,-t*.7));",
    "  float n2=fbm(q*4.6-n*1.4+vec2(-t*1.3,t));",
    "  vec3 deep=vec3(0.0,0.082,0.36);",
    "  vec3 ikb=vec3(0.0,0.184,0.655);",
    "  vec3 lift=vec3(0.07,0.29,0.86);",
    "  vec3 col=mix(deep,ikb,smoothstep(.18,.72,n));",
    "  col=mix(col,lift,smoothstep(.52,.92,n2)*.5);",
    "  float v=1.-smoothstep(.15,1.25,length((uv-vec2(.5,.62))*vec2(asp*.7,1.)));",
    "  col*=mix(.68,1.08,v);",
    /* pigment heaped at the edge of the push catches the light */
    "  float ridge=smoothstep(.0,.6,push)*(1.-smoothstep(.6,1.4,push));",
    "  col+=vec3(.03,.07,.22)*ridge+vec3(.0,.02,.08)*push;",
    "  gl_FragColor=vec4(col,1.);",
    "}",
  ].join("\n");

  function lowPower() {
    var c = navigator.connection;
    if (c && c.saveData) return true;
    return (navigator.hardwareConcurrency || 4) <= 2;
  }

  function init(canvas, opts) {
    opts = opts || {};
    if (!canvas || lowPower()) return null;
    var gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return null;

    /* Without a GPU (VMs, headless, some old laptops), WebGL runs on the
       CPU and would eat the main thread: keep the CSS field instead. */
    var dbg = gl.getExtension("WEBGL_debug_renderer_info");
    var renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(renderer)) && !window.__forceGL) return null;

    /* Touch screens: no hover to react to, so a cheaper, calmer field. */
    var coarse = window.matchMedia("(pointer: coarse)").matches;
    var SCALE = coarse ? 0.35 : 0.5;
    var MIN_DT = coarse ? 1000 / 30 : 0;

    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
      return null;
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "uRes");
    var uTime = gl.getUniformLocation(prog, "uTime");
    var uTrail = gl.getUniformLocation(prog, "uTrail");

    var trail = new Float32Array(TRAIL * 3);
    var head = 0;
    var last = null;
    var running = false;
    var visible = true;
    var raf = 0;
    var t0 = performance.now();
    var frames = 0;
    var lastDraw = 0;

    /* The field is soft by nature: render it at a fraction of the
       screen and let CSS upscale. The fine grain is the CSS .grain
       layer on top, so nothing crisp is lost. */
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5) * SCALE;
      var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function draw(now) {
      resize();
      for (var i = 0; i < TRAIL; i++) trail[i * 3 + 2] *= 0.972;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) / 1000 + 40);
      gl.uniform3fv(uTrail, trail);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frames++;
    }

    function loop(now) {
      if (!running) return;
      if (now - lastDraw >= MIN_DT) {
        lastDraw = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || opts.still || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function addPoint(clientX, clientY) {
      var r = canvas.getBoundingClientRect();
      var x = (clientX - r.left) / r.width;
      var y = 1 - (clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      if (last) {
        var dx = (x - last[0]) * (r.width / r.height);
        var dy = y - last[1];
        if (dx * dx + dy * dy < 0.0009) return;
      }
      last = [x, y];
      trail[head * 3] = x;
      trail[head * 3 + 1] = y;
      trail[head * 3 + 2] = 1;
      head = (head + 1) % TRAIL;
    }

    if (!opts.still) {
      var target = opts.pointerTarget || canvas;
      target.addEventListener("pointermove", function (e) {
        addPoint(e.clientX, e.clientY);
      }, { passive: true });
      target.addEventListener("pointerleave", function () {
        last = null;
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });
    window.addEventListener("resize", function () {
      if (!running) draw(performance.now());
    });

    /* First frame right away, then reveal over the CSS fallback. */
    draw(performance.now());
    canvas.classList.add("ready");
    start();

    return {
      start: start,
      stop: stop,
      frames: function () {
        return frames;
      },
      poke: addPoint,
    };
  }

  return { init: init };
})();
