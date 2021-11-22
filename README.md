# cubevis

Work in progress for advanced interactive marine data visualisations.

[Demo](https://irishmarineinstitute.github.io/adcpvis/)

## Acknowledgments

<span style="background-color:#fff;"><img src="https://raw.githubusercontent.com/IrishMarineInstitute/zapidox/master/img/dafm.png" alt="DAFM Logo" style="height: 50px;"/> <img src="https://raw.githubusercontent.com/IrishMarineInstitute/zapidox/master/img/forasnamara.jpg" alt="Marine Institute Logo" style="height: 50px;"/> <img src="https://raw.githubusercontent.com/IrishMarineInstitute/zapidox/master/img/eu-emff.png" alt="EU EMFF Logo" style="height: 50px;"/> <img src="https://raw.githubusercontent.com/IrishMarineInstitute/zapidox/master/img/eu_sifp.jpg" alt="EU Structural Infrastructure Fund and Programme Logo" style="height: 50px;"/></span>

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
