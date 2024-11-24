import {Curtains, Plane, Vec2, RenderTarget, ShaderPass, TextureLoader} from "../node_modules/curtainsjs/src/index.mjs";
window.addEventListener("load", () => {
    const curtains = new Curtains({
        container: "canvas",
        pixelRatio: window.devicePixelRatio,
        watchScroll: true,
    });

    const loader = new TextureLoader(curtains);
    const asciiSprites = new Image();
    asciiSprites.crossOrigin = "anonymous";
    asciiSprites.src = "../images/charSprites.png";

    let asciiTexture;
    loader.loadImage(asciiSprites, {
        sampler: "charSpriteSheet"
    }, (texture) => {
        asciiTexture = texture;
    }, (image, error) => {
        console.log("oops");
    });
    
    //#region setup fractal noise backgrounds
    const fractalBgs = document.getElementsByClassName("fractalBg");
    
    for (const fractalBg of fractalBgs){
        var res = new Vec2(fractalBg.offsetWidth,fractalBg.offsetHeight);
        var mouse = new Vec2(0.0,0.0);

        const params = {
            uniforms:{
                time:{
                    name: "u_time",
                    type: "1f",
                    value: 0.0,
                },
                resolution:{
                    name: "u_resolution",
                    type: "2f",
                    value: res,
                },
                mouse:{
                    name: "u_mouse",
                    type: "2f",
                    value: mouse,
                }
            },
        };

        const bgPlane = new Plane(curtains, fractalBg, params);
        bgPlane.onRender(() => {
            bgPlane.uniforms.time.value += 0.01;
        });
        fractalBg.addEventListener("mousemove", (event) => {
            var rect = fractalBg.getBoundingClientRect();
            bgPlane.uniforms.mouse.value.x = curtains.lerp(bgPlane.uniforms.mouse.value.x,event.clientX - rect.left,0.1);
            bgPlane.uniforms.mouse.value.y = curtains.lerp(bgPlane.uniforms.mouse.value.y,event.clientY - rect.top,0.1);
        });
        bgPlane.onAfterResize(() => {
            bgPlane.uniforms.resolution.value.x = fractalBg.offsetWidth;
            bgPlane.uniforms.resolution.value.y = fractalBg.offsetHeight;
        });
    };
    //#endregion

    const asciiTest = document.getElementsByClassName("asciiTest")[0];

    const asciiPlane = new Plane(curtains, asciiTest);

    const asciiTarget = new RenderTarget(curtains);
    //asciiPlane.setRenderTarget(asciiTarget);

    var asciiRect = asciiTest.getBoundingClientRect;
    var asciiRes = new Vec2(asciiRect.right-asciiRect.left,asciiRect.bottom-asciiRect.top);
    const asciiPassParams = {
        vertexShaderID: "simple-vs",
        fragmentShaderID: "ascii-fs",
        renderTarget: asciiTarget,
        uniforms:{
            resolution:{
                name: "u_resolution",
                type: "2f",
                value: asciiRes,
            }
        }
    }
    const asciiPass = new ShaderPass(curtains, asciiPassParams);
    asciiPass.createTexture({
        sampler:"charSpriteSheet",
        fromTexture:asciiTexture});
    
});