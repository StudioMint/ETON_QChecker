#target photoshop
var scriptFolder = (new File($.fileName)).parent; // The location of this script

// Keeping the ruler settings to reset in the end of the script
var startRulerUnits = app.preferences.rulerUnits;
var startTypeUnits = app.preferences.typeUnits;
var startDisplayDialogs = app.displayDialogs;

// Changing ruler settings to pixels for correct image resizing
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
app.displayDialogs = DialogModes.NO;

// VARIABLES

var troubleshoot = true;

try {
    init();
} catch(e) {
    alert("Error code " + e.number + " (line " + e.line + "):\n" + e);
}

// Reset the ruler
app.preferences.rulerUnits = startRulerUnits;
app.preferences.typeUnits = startTypeUnits;
app.displayDialogs = startDisplayDialogs;

function init() {
    
    // Preparation before running the main script
    
    if (activeDocument && !troubleshoot) {
        activeDocument.suspendHistory("Name to be shown in history window", "main()");
    } else {
        main();
    }

}

function main() {

    // 8 bit
    if (activeDocument.bitsPerChannel != BitsPerChannelType.EIGHT) changeBitDepth(8);

    // Rasterise Liquify
    try {
        activeDocument.layerSets.getByName("Group 1").artLayers.getByName("Liquify").rasterize(RasterizeType.ENTIRELAYER);
    } catch(e) {}

    // Mask in "Hue on hot skin"
    try {
        activeDocument.activeLayer = activeDocument.layerSets.getByName("Group 1").layerSets.getByName("Garment");
        selectionFromMask();
        if (activeDocument.selection.bounds[0].value != 0 && activeDocument.selection.bounds[2] != activeDocument.width) {
            activeDocument.selection.deselect();
            activeDocument.activeLayer = activeDocument.layerSets.getByName("Group 1").layerSets.getByName("Adj").layerSets.getByName("Skin").artLayers.getByName("Hue on hot skin");
            selectionFromMask();
            activeDocument.selection.invert();
            if (activeDocument.selection.bounds == undefined) saveTxt(activeDocument.name + ": Missing mask for \"Hue on red skin\"", activeDocument.name, activeDocument.path);
        }
    } catch(e) {}
    activeDocument.selection.deselect();

}

// FUNCTIONS

function changeBitDepth(bit) {
    var idconvertMode = stringIDToTypeID( "convertMode" );
        var desc3 = new ActionDescriptor();
        var iddepth = stringIDToTypeID( "depth" );
        desc3.putInteger( iddepth, bit );
        var idmerge = stringIDToTypeID( "merge" );
        desc3.putBoolean( idmerge, false );
    executeAction( idconvertMode, desc3, DialogModes.NO );
}

function selectionFromMask() {
    var idset = stringIDToTypeID( "set" );
        var desc307 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
            var ref268 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idselection = stringIDToTypeID( "selection" );
            ref268.putProperty( idchannel, idselection );
        desc307.putReference( idnull, ref268 );
        var idto = stringIDToTypeID( "to" );
            var ref269 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idchannel = stringIDToTypeID( "channel" );
            var idmask = stringIDToTypeID( "mask" );
            ref269.putEnumerated( idchannel, idchannel, idmask );
        desc307.putReference( idto, ref269 );
    executeAction( idset, desc307, DialogModes.NO );
}
function saveTxt(text, name, path, ext) {
    if (!ext) ext = ".txt";
    var saveFile = File(Folder(path) + "/" + name + ext);
    if (saveFile.exists) saveFile.remove();
    saveFile.encoding = "UTF8";
    saveFile.open("e", "TEXT", "????");
    saveFile.writeln(text);
    saveFile.close();
}