# cubevis

Work in progress for advanced interactive marine data visualisations.

[Demo](https://irishmarineinstitute.github.io/adcpis/)

## Usage

```html
    <div id="adcp"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.js"></script>
    <script src="https://threejs.org/examples/js/controls/OrbitControls.js"></script>       
    <script src="https://irishmarineinstitute.github.io/pd0-parser/dist/pd0parser.js"></script>
    <script src="https://irishmarineinstitute.github.io/adcpvis/dist/adcpvis.js"></script>
    <script>
            const adcpvis = new ADCPvis("adcp",{width: 600, height: 600});
            var loadPd0 = function () {
                var pd0url = (location.hash && location.hash.substring(1)) || "https://irishmarineinstitute.github.io/pd0-parser/demo/TRDI-WHB600Hz-1323_20160404.pd0";
                adcpvis.fetchPd0(pd0url);
            };
            window.onhashchange = loadPd0;
            loadPd0();
    </script>

```
