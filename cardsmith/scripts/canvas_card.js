import * as constants from './constants.js';

const { drawText } = window.canvasTxt;

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
canvas.width = 747;
canvas.height = 1043;
var formFields = getFormValues();
await updateCanvas();

document.getElementById("card-details-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    var formElementsArray = Array.from(event.target.elements);
    var tmpFormFields = formElementsArray.reduce(function (acc, formElement) {
        var elementType = formElement.type;
        var elementName = formElement.name;
        if (elementType === 'radio') {
            if (formElement.checked) {
                acc[elementName] = formElement.value.trim();
            }
        } else if (elementType === 'checkbox') {
            acc[elementName] = formElement.checked;
        } else if (elementType === 'file') {
            acc[elementName] = formElement.files[0];
        } else {
            acc[elementName] = formElement.value.trim();
        }
        return acc;
    }, {});
    if (tmpFormFields.bgImgInputType === 'url') {
        tmpFormFields.backgroundImageSrc = tmpFormFields["bg-image-url"];
    } else if (tmpFormFields.bgImgInputType === 'upload') {
        tmpFormFields.backgroundImageSrc = tmpFormFields["bg-image-upload"];
    } else {
        console.error("bgImgInputType must be either 'url' or 'file'.");
    }

    var isValid = await validateInputs(tmpFormFields);
    if (isValid) {
        formFields = tmpFormFields;
        await updateCanvas();
    }
});

function getFormValues() {
    var form = document.getElementById('card-details-form');
    var formData = {};

    for (var i = 0; i < form.elements.length; i++) {
        var element = form.elements[i];
        if (element.type === 'radio') {
            if (element.checked) {
                formData[element.name] = element.value.trim();
            }
        } else if (element.type === 'checkbox') {
            formData[element.name] = element.checked;
        } else if (element.type === 'file') {
            formData[element.name] = element.files[0];
        } else {
            formData[element.name] = element.value.trim();
        }
    }
    if (formData.bgImgInputType === 'url') {
        formData.backgroundImageSrc = formData["bg-image-url"];
    } else if (formData.bgImgInputType === 'upload') {
        formData.backgroundImageSrc = formData["bg-image-upload"];
    } else {
        console.error("bgImgInputType must be either 'url' or 'file'.");
    }
    return formData;
}

function clearForm() {
    var myForm = document.getElementById('card-details-form');
    var textInputs = myForm.querySelectorAll('input[type="text"], textarea, input[type="file"]');
    textInputs.forEach(function (input) {
        if (input.type === 'file') {
            input.form.reset();
        } else {
            input.value = '';
        }
    });
    var selectInputs = myForm.querySelectorAll('select');
    selectInputs.forEach(function (select) {
        select.selectedIndex = 0;
    });
    var bgImageUrlInput = myForm.querySelector('#bg-image-url');
    if (bgImageUrlInput) {
        bgImageUrlInput.value = '';
    }
}

async function validateInputs(tmpFormFields) {
    var totalAttrCost = 0;
    for (var colorAttr of ['w', 'r', 'u', 'g', 'b', 'm', 't']) {
        totalAttrCost += parseInt(tmpFormFields[`${colorAttr}-cost`], 10);
    }
    if (totalAttrCost > 5) {
        alert("The total non-void cost cannot exceed 5.");
        return false;
    }

    return true;
}

async function updateCanvas() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rarity = formFields["rarity"];
    const imageSrcs = [
        { name: 'background', src: formFields["backgroundImageSrc"] },
        { name: 'borderFrame', src: `./img/frames/${rarity}/border.png` },
        { name: 'nameWheel', src: `./img/frames/${rarity}/namewheel.png` },
        { name: 'qcWheel', src: `./img/frames/${rarity}/qcwheel.png` },
        { name: 'footer', src: `./img/frames/${rarity}/footer.png` },
        { name: 'w', src: './img/symbols/' + constants.imgFiles.w[0] },
        { name: 'wFa', src: './img/symbols/' + constants.imgFiles.w[1] },
        { name: 'r', src: './img/symbols/' + constants.imgFiles.r[0] },
        { name: 'rFa', src: './img/symbols/' + constants.imgFiles.r[1] },
        { name: 'u', src: './img/symbols/' + constants.imgFiles.u[0] },
        { name: 'uFa', src: './img/symbols/' + constants.imgFiles.u[1] },
        { name: 'g', src: './img/symbols/' + constants.imgFiles.g[0] },
        { name: 'gFa', src: './img/symbols/' + constants.imgFiles.g[1] },
        { name: 'b', src: './img/symbols/' + constants.imgFiles.b[0] },
        { name: 'bFa', src: './img/symbols/' + constants.imgFiles.b[1] },
        { name: 'm', src: './img/symbols/' + constants.imgFiles.m[0] },
        { name: 't', src: './img/symbols/' + constants.imgFiles.t[0] },
        { name: 'vFa', src: './img/symbols/' + constants.imgFiles.v[1] },
    ];

    try {
        const images = await loadImages(imageSrcs);
        var cardColors = [];
        var costImgs = [];
        for (var colorAttr of ['w', 'r', 'u', 'g', 'b', 'm', 't']) {
            var num = parseInt(formFields[`${colorAttr}-cost`], 10);
            if (num > 0) {
                if (colorAttr !== 'm' && colorAttr !== 't') {
                    cardColors.push(colorAttr);
                }
                for (var i = 0; i < num; i++) {
                    costImgs.push(images[colorAttr]);
                }
            }
        }
        if (cardColors.length === 0) {
            cardColors.push('v');
        }
        const typeImgs = ['wFa', 'rFa', 'uFa', 'gFa', 'bFa', 'vFa'].reduce((acc, attr) => {
            acc[attr] = images[attr];
            return acc;
        }, {});

        drawImageWithBorderRadius(images.background);
        drawImageWithBorderRadius(images.borderFrame);
        drawNameBox(cardColors);
        drawImageWithBorderRadius(images.nameWheel);
        if (formFields["quickcast"] === "Yes") {
            drawImageWithBorderRadius(images.qcWheel);
        }
        drawImageWithBorderRadius(images.footer);

        await document.fonts.load('16px FOW_Name').then(function () {
            drawAutoFitText(formFields["card-name"], 209, 59.5, 677, 94.5, 'FOW_Name', 40, 'white', 'black');
        });

        await document.fonts.load('16px FOW_Text').then(function () {
            ctx.font = "italic 28px FOW_Text";
            ctx.fillStyle = "white";
            ctx.fillText(formFields["void-cost"], constants.attrCoords[5].x, constants.attrCoords[5].y);
        });

        costImgs.forEach(function (image, index) {
            ctx.drawImage(image, constants.attrCoords[index].x, constants.attrCoords[index].y, 34, 34);
        });

        drawInfoBox(cardColors, typeImgs);
    } catch (error) {
        console.error('Error loading images: ', error);
    }
}

async function loadImages(imageSrcs) {
    const promises = imageSrcs.map(({ name, src }) => loadImage(name, src));
    return Promise.all(promises).then(images => {
        return images.reduce((acc, image) => {
            acc[image.name] = image.image;
            return acc;
        }, {});
    });
}

async function loadImage(name, src) {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.crossOrigin = 'Anonymous';

        image.onload = function () {
            resolve({ name, image });
        };

        image.onerror = function (error) {
            reject(error);
        };

        if ((typeof src === 'string' || src instanceof String) && (src.startsWith('./') || src.startsWith('http') || src.startsWith('data:image'))) {
            image.src = src;
        } else if (src instanceof File && src.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function (e) {
                image.src = e.target.result;
            };
            reader.readAsDataURL(src);
        } else {
            // reject(new Error('Invalid src'));
            alert('Invalid or no image provided. Defaulting to blank background.');
            image.src = './img/other/blank.png';
        }
    });
}

function drawImageWithBorderRadius(image, radius = 43) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(canvas.width - radius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    ctx.lineTo(canvas.width, canvas.height - radius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
    ctx.lineTo(radius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function drawNameBox(colors) {
    var x = 160;
    var y = 45;
    var width = 542;
    var height = 55;
    var step = 0.90 / Math.max(colors.length - 1, 1);
    var gradient = ctx.createLinearGradient(x, y, x + width, y + height);

    for (var i = 0; i < colors.length; i++) {
        var baseOffset = 0.05 + i * step;
        gradient.addColorStop(baseOffset, constants.attrColors[colors[i]].nameBoxColor);
        if (i > 0) {
            var prevOffset = 0.05 + (i - 1) * step;
            var leftOffset = ((baseOffset + prevOffset) / 2) + 0.05;
            gradient.addColorStop(leftOffset, constants.attrColors[colors[i]].nameBoxColor);
        }
        if (i < colors.length - 1) {
            var nextOffset = 0.05 + (i + 1) * step;
            var rightOffset = ((baseOffset + nextOffset) / 2) - 0.05;
            gradient.addColorStop(rightOffset, constants.attrColors[colors[i]].nameBoxColor);
        }
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
}

function drawAutoFitText(text, x1, y1, x2, y2, font, maxFontSize, textColor, strokeColor) {
    // Use a copy of the canvas context to measure text without affecting the main context
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = 'bold ' + maxFontSize + 'px ' + font;

    // Calculate the initial width and height of the text
    var textWidth = tempCtx.measureText(text).width;
    var textHeight = maxFontSize;

    // Calculate the scale factor for width and height
    var scaleWidth = (x2 - x1) / textWidth;
    var scaleHeight = (y2 - y1) / textHeight;

    // Use the smaller scale factor to ensure the text fits both horizontally and vertically
    var scale = Math.min(scaleWidth, scaleHeight);

    // Calculate the new font size based on the scale factor
    var fontSize = Math.floor(maxFontSize * scale);

    // Draw the text on the main canvas with the calculated font size
    ctx.font = '' + fontSize + 'px ' + font;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;  // Adjust the stroke width as needed

    // Center-align the text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeText(text, (x1 + x2) / 2, (y1 + y2) / 2);
    ctx.fillText(text, (x1 + x2) / 2, (y1 + y2) / 2);
}

function drawInfoBox(effectHeaderColors, attributeIcons) {
    drawEffectBox();
    drawEffectBoxHeader(effectHeaderColors);
    drawAttributeTypes(effectHeaderColors, attributeIcons);
}

function formatEffectText(effectText) {
    var spacedText = effectText.split("\n").map(item => item = "<span class='cardEffect'>" + item + "</span>").join("<span class='brmedium'></span>");
    var regex = /{([^}]+)}/g;
    var replacedText = spacedText.replace(regex, function (match, token) {
        var imgProperty = constants.imgFiles[token.toLowerCase()];
        var imagePath = imgProperty ? imgProperty[0] : constants.imgFiles.error[0];
        return '<img class="effectImage" src="./img/symbols/' + imagePath + '">';
    });
    return replacedText;
}

function drawEffectBox() {
    var x = 55.5;
    var y = 691.5;
    var width = 637;
    var height = 300.5;
    var transparency = 0.65;
    var bottomRadius = 17;

    ctx.fillStyle = 'rgba(255, 255, 255, ' + transparency + ')';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height - bottomRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRadius, y + height);
    ctx.lineTo(x + bottomRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - bottomRadius);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();

    drawEffectText(formatEffectText(formFields["card-ability"]));
    drawFlavorText(formFields["card-flavor"]);
    drawAdditionalInfo();
}

function drawEffectText(effectText) {
    var fontSize = 27;
    const tempDiv = document.createElement('div');
    tempDiv.id = 'effectDiv';
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.style.fontSize = fontSize + 'px';
    tempDiv.innerHTML = effectText;

    document.getElementById("formDiv").appendChild(tempDiv);
    adjustFontSize(fontSize, tempDiv.id);

    html2canvas(tempDiv, { allowTaint: true, backgroundColor: null, scale: 1.5 }).then(cv => {
        ctx.drawImage(cv, 83.5, 702, 580, 230);
        document.getElementById("formDiv").removeChild(tempDiv);
    });
}

function drawFlavorText(flavorText) {
    var fontSize = 18;
    const tempDiv = document.createElement('div');
    tempDiv.id = 'flavorDiv';
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.style.fontSize = fontSize + 'px';
    tempDiv.innerHTML = flavorText;

    document.getElementById("formDiv").appendChild(tempDiv);
    adjustFontSize(fontSize, tempDiv.id);

    html2canvas(tempDiv, { allowTaint: true, backgroundColor: null, scale: 1.5 }).then(cv => {
        ctx.drawImage(cv, 83.5, 932, 580, 55);
        document.getElementById("formDiv").removeChild(tempDiv);
    });
}

function drawEffectBoxHeader(effectHeaderColors) {
    var x = 55.5;
    var y = 640;
    var width = 637;
    var height = 52;
    var transparency = 0.9;
    var topRadius = 17;

    ctx.fillStyle = 'rgba(255, 255, 255, ' + transparency + ')';
    ctx.beginPath();
    ctx.moveTo(x + topRadius, y);
    ctx.lineTo(x + width - topRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + topRadius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + topRadius);
    ctx.quadraticCurveTo(x, y, x + topRadius, y);
    ctx.closePath();

    var gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    var lastIndex = Math.max(effectHeaderColors.length - 1, 1);
    for (var i = 0; i < effectHeaderColors.length; i++) {
        if (i === 0) {
            gradient.addColorStop(i / lastIndex + 0.05, constants.attrColors[effectHeaderColors[i]].effectHeaderColor);
        } else if (i === effectHeaderColors.length - 1) {
            gradient.addColorStop(i / lastIndex - 0.05, constants.attrColors[effectHeaderColors[i]].effectHeaderColor);
        } else {
            gradient.addColorStop(i / lastIndex, constants.attrColors[effectHeaderColors[i]].effectHeaderColor);
        }
    }
    ctx.fillStyle = gradient;
    ctx.fill();

    drawTypeRaceTrait(effectHeaderColors[0]);
}

function drawTypeRaceTrait(firstColor) {
    document.fonts.load('16px FOW_Text').then(function () {
        if (firstColor === 'g' || firstColor === 'b') {
            ctx.font = "22px FOW_Text";
            ctx.fillStyle = "white";
        } else {
            ctx.font = "bold 22px FOW_Text";
            ctx.fillStyle = "black";
        }
        ctx.textAlign = "left";
        ctx.save();
        ctx.scale(1.1, 1);
        var typeRaceTraitText = formFields["card-type"];
        if (formFields["card-race"] !== "") {
            typeRaceTraitText += " (" + formFields["card-race"] + ")";
        }
        ctx.fillText(typeRaceTraitText, 74, 666);
        ctx.restore();
    });
}

function drawAdditionalInfo() {
    document.fonts.load('16px Footer_Text').then(function () {
        ctx.font = "16px Footer_Text";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.save();
        ctx.scale(1.3, 1);

        var collRarityText = formFields["collector-number"] + " ";
        if (formFields["rarity"] !== "") {
            collRarityText += formFields["rarity"];
        }
        drawTextWithSpacing(collRarityText, 70, 1023, 0.5);

        var artistText = "Illust/" + formFields["artist"];
        ctx.textAlign = "right";
        ctx.fillText(artistText, 500, 1023);

        // ©
        var copyrightText = formFields["copyright"];
        ctx.font = "bold 18px Footer_Text";
        ctx.textAlign = "center";
        ctx.fillText(copyrightText, 287, 1023);

        ctx.restore();
    });
}

function drawTextWithSpacing(text, x, y, letterSpacing) {
    for (var i = 0; i < text.length; i++) {
        var letter = text[i];
        ctx.fillText(letter, x, y);
        x += ctx.measureText(letter).width + letterSpacing;
    }
}

function drawAttributeTypes(effectHeaderColors, attrImages) {
    var iconSize = 38;
    var iconSpacing = 30 - (5 * effectHeaderColors.length);
    var currentX = 640;

    ctx.font = "16px Arial";
    ctx.fillStyle = "black";

    effectHeaderColors.reverse().forEach(function (ehColor) {
        ctx.drawImage(attrImages[ehColor + "Fa"], currentX, 647, iconSize, iconSize);
        currentX -= iconSize + iconSpacing;
    });
}

function adjustFontSize(fontSize, divId) {
    var textDiv = document.getElementById(divId);
    var originalFontSize = fontSize; // default font size

    textDiv.style.fontSize = originalFontSize + 'px';

    // Check if content overflows the container in either width or height
    while (
        textDiv.scrollWidth > textDiv.clientWidth ||
        textDiv.scrollHeight > textDiv.clientHeight
    ) {
        textDiv.style.fontSize = (parseFloat(textDiv.style.fontSize) - 1) + 'px';
    }
}

function downloadCard() {
    var dataURL = canvas.toDataURL("image/png");
    var newTab = window.open('about:blank', 'transparent PNG converted from canvas');
    newTab.document.write("<img src='" + dataURL + "' alt='transparent PNG converted from canvas'/>");
}


window.updateCanvas = updateCanvas;
window.downloadCard = downloadCard;
window.clearForm = clearForm;
