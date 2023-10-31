$('#multiselect').multiselect();
$("#multiselect").off('dblclick');
$("#multiselect_to").off('dblclick');

function multiselectRightSelected() {
    let selectedOptions = $('#multiselect').multiselect('getSelected');
    let selectedValues = [];
    selectedOptions.each(function (index, option) {
        selectedValues.push($(option).val()); // Get the value of the selected option
    });
    let optionsArray = [...document.getElementById('multiselect').children];
    let routeString = optionsArray.filter(option => selectedValues.flat().includes(option.value)).map(option => option.innerText).toString();
    putOut(routeString);
}

function multiselectLeftSelected() {
    const selectedOptions = $('#multiselect_to').multiselect('getSelected');
    let selectedValues = [];
    selectedOptions.each(function (index, option) {
        selectedValues.push($(option).val()); // Get the value of the selected option
    });
    let optionsArray = [...document.getElementById('multiselect_to').children];
    let routeString = optionsArray.filter(option => selectedValues.flat().includes(option.value)).map(option => option.innerText).toString();
    putIn(routeString);
}

function putIn(routeString) {
    fetch('/in?in=' + encodeURIComponent(routeString)).then(response => {
        if (!response.ok) {
            console.error("Failed putting dices in!");
        } else {
            window.location.href = '/kniffel';
        }
    });
}

function putOut(routeString) {
    fetch('/out?out=' + encodeURIComponent(routeString)).then(response => {
        if (!response.ok) {
            console.error("Failed putting dices out!");
        } else {
            window.location.href = '/kniffel';
        }
    });
}