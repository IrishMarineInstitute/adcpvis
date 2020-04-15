if(typeof(THREE) === 'undefined' || THREE.OrbitControls === undefined || typeof(pd0parser) === 'undefined'){
    console.log(`ERROR: Developer you must include these lines in your html before adcpvis
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.js"></script>
    <script src="https://threejs.org/examples/js/controls/OrbitControls.js"></script>       
    <script src="https://irishmarineinstitute.github.io/pd0-parser/dist/pd0parser.js"></script>
        `)
}

function ADCPvis(elid, options){
    options = options || {};

    const el = document.getElementById(elid);
    this.container = document.createElement("div");
    this.width = options.width || 300;
    this.height = options.height || 300;
    this.container.style.width = ""+this.width+"px";
    el.appendChild(this.container);
    this.cube_urls = options.cube_urls ||
        ["wnx.jpg", "wnx.jpg", "wpy.jpg", "wnz.jpg", "wnx.jpg", "wnx.jpg"].map(x=>"https://irishmarineinstitute.github.io/adcpvis/"+x);
    this.velocities = undefined;
    this.spheres = [];
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 100000);
    this.camera.position.z = 12000;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(this.width/this.height);
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;
    this._animate = this.animate.bind(this);// save continuous rebinding during animate()
    this.date_label = document.createElement("h4");
    this.date_label.style["width"] = "100%";
    this.date_label.style["text-align"] = "center";
    this.container.appendChild(this.date_label);
    this.range_control = document.createElement("input");
    this.range_control.type = "range";
    this.range_control.style["z-index"] = 1;
    this.range_control.style.bottom = "10px";
    this.range_control.style.width = "100%";
    this.range_control.min = 0;
    this.range_control.max = 0;
    this.range_control.value = 0;
    this.range_control.addEventListener("change",function(e){
        this._setPD0(e.target.value);
    }.bind(this));

    this.pd0s = [];
    //   this.range_control.setAttr
    this.container.appendChild(this.range_control);
    let label = document.createElement("label");
    label.innerText = "Upload your own pd0 file"
    let fileinput = document.createElement("input");
    fileinput.type = "file";
    let setPD0s = this.setPD0s.bind(this);
    fileinput.onchange = function(e){
        var reader = new FileReader();
        reader.onload = function(){
          var buffer = new Uint8Array(this.result);
          new pd0parser().parse(buffer).then(setPD0s).catch(e=>console.log(e));
        };
        reader.readAsArrayBuffer(e.target.files[0]);
    }
    label.appendChild(fileinput);
    this.container.appendChild(fileinput);
}
ADCPvis.prototype.setPD0s = function(pd0s){
    this.pd0s = pd0s.filter(x => x.velocity && x.velocity.data && x.velocity.data.length);
    if(this.pd0s && this.pd0s.length){
        this.range_control.setAttribute("max", this.pd0s.length-1);
        this.range_control.setAttribute("value",0);
        this.range_control.style.visibility = this.pd0s.length>1?"visible":"hidden";
        this._setPD0(0);
    }
}
ADCPvis.prototype._setPD0 = function(idx){
    if(this.pd0s && this.pd0s.length){
        idx = Math.min(idx,this.pd0s.length-1);
        let pd0 = this.pd0s[idx];
        this.setVelocities(pd0.velocity.data);
        this.date_label.innerText = pd0.timestamp?pd0.timestamp:"";
    }
}
ADCPvis.prototype.setVelocities = function(velocities){
    if(velocities){
        if(!this.velocities){
            this.init(velocities);
            this.animate();
        }
        this.velocities = velocities;
    }

}

ADCPvis.prototype.init = function(velocity_data) {
    this.velocities = velocity_data;

    var path = "";
    var format = '.jpg';

    var textureCube = new THREE.CubeTextureLoader().load(this.cube_urls);
    textureCube.mapping = THREE.CubeRefractionMapping;

    var material = new THREE.MeshBasicMaterial({ wireframe: true, opacity: 0.1, color: 0x000000, transparent: true });
    var mGlass = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        envMap: textureCube,
        opacity: 0.1,
        transparent: true,
        wireframe: true
    });

    var mesh = new THREE.Mesh(new THREE.CylinderGeometry(100, 100, 10000, 16, 1, true), material);
    mesh.renderDepth = -1.1;
    this.scene.add(mesh);

    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.70 });


    var bubblesPerBin = 25;
    var numBubbles = this.velocities.length * bubblesPerBin;

    for (var i = 0; i < numBubbles; i++) {

        var geometry = new THREE.SphereBufferGeometry(Math.random() * 80 + 20, 32, 16);

        var binIndex = i % this.velocities.length;

        var v = this.velocities[binIndex];

        var progress = Math.random(); //random % of travel distance from 0 to 5000 (edge of cube)

        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = 0; 
        mesh.position.y = this.calculateBinPosition(this.velocities.length, binIndex);
        mesh.position.z = 0;


        var xvelocity = v[0];
        var zvelocity = v[1];
        var yvelocity = v[2];


        //randomly place bubble along it's trajectory path (to spread out the bubbles in each bin)
        var max = Math.max(xvelocity, zvelocity);

        var sign = max < 0 ? -1 : 1;
        mesh.position.x = xvelocity * progress * 5000 / max * sign;
        mesh.position.z = zvelocity * progress * 5000 / max * sign;
        mesh.position.y += yvelocity * progress * 5000 / max * sign;

        this.scene.add(mesh);

        this.spheres.push(mesh);
    }

    // Skybox

    var shader = THREE.ShaderLib["cube"];
    shader.uniforms["tCube"].value = textureCube;

    material = new THREE.ShaderMaterial({

        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        side: THREE.BackSide

    }),

    mesh = new THREE.Mesh(new THREE.BoxGeometry(100000, 100000, 100000), material);

    this.scene.add(mesh);
    /*
    this.container.addEventListener('resize', function() {
            this.width = this.container.innerWidth;
            this.height = this.container.innerHeight;
            this.renderer.setPixelRatio(this.width/this.height);
            this.renderer.setSize(this.width, this.height);
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
                //effect.setSize( window.innerWidth, window.innerHeight );
            }.bind(this), false);
            */

}


ADCPvis.prototype.calculateBinPosition = function(numBins, binIndex) {
    var pixelsBetweenBins = 350;
    return ((binIndex * pixelsBetweenBins) - (numBins / 2 * pixelsBetweenBins));
}


ADCPvis.prototype.animate = function() {
    requestAnimationFrame(this._animate);
    this.render();
    this.controls.update();
}

ADCPvis.prototype.render = function() {
    var timer = 0.0001 * Date.now();

    for (var i = 0, il = this.spheres.length; i < il; i++) {
        var binIndex = i % this.velocities.length;
        var v = this.velocities[binIndex];
        var sphere = this.spheres[i];

        sphere.position.x += (v[0]) / 10;
        sphere.position.z += (v[1]) / 10;
        sphere.position.y += (v[2]) / 10;


        //"refresh" sphere back to center after it leaves the cube
        if (Math.abs(sphere.position.x) > 5000 || Math.abs(sphere.position.z) > 5000) {
            sphere.position.x = 0;
            sphere.position.z = 0;
            sphere.position.y = this.calculateBinPosition(this.velocities.length, binIndex);
        }

    }

    this.renderer.render(this.scene, this.camera);
}

ADCPvis.prototype.fetchPd0 = function(pd0url){
    fetch(pd0url)
        .then(response=>response.arrayBuffer())
        .then(ab => new Uint8Array(ab))
        .then(buffer => new pd0parser().parse(buffer))
        .then(pd0s => pd0s.filter(x => x.velocity))
        .then(this.setPD0s.bind(this))
        .catch(e=>{
            console.log("error processing ["+pd0url+"]",e);
        });
}


module.exports = ADCPvis;