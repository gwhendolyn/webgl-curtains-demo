import { Curtains, Plane } from "../node_modules/curtainsjs/src/index.mjs";

window.addEventListener("load", () => {
    const curtains = new Curtains({
        container: "canvas"
    });

    const planeElement = document.getElementsByClassName("plane")[0];

    const params = {
        vertexShaderID: planeElement.dataset.vsId,
        fragmentShaderID: planeElement.dataset.fsId,
        uniforms:{
            time:{
                name: "uTime",
                type: "1f",
                value: 0,
            },
        },
    };

    const plane = new Plane(curtains, planeElement, params);

    plane.onRender(() => {
        plane.uniforms.time.value++;
    });
});