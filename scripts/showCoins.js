$('#selCoin').change(function () {
    $('#div1').html(" ");
    let selectCoin = $('#selCoin option:selected').val();
    let table = "<table class='table'><thead><tr><th>Wallet name</th><th>Coin balance</th>" +
        "<th>USD Balance</th></tr></thead>" +
        "<tbody></tbody></table>";
    $('#div1').html(table);
    $.ajax({
        url: "/user/wallet",
        method: "POST",
        data: { coin: selectCoin },
        success: function (resp) {
            $.each(resp.wallets, (i, item) => {
                let rows = "<tr data-href='/user/wallet/" + selectCoin + "/" + item._wallet.id + " ' " + "class='clickable-row'><td>" + item._wallet.label + "</td><td>" + (item._wallet.balance / 1e8).toFixed(4) + "</td><td>" + "$" + ((item._wallet.balance / 1e8).toFixed(4) * 3710.43).toFixed(2) + "</td>" + "</tr>";
                $('table tbody').append(rows);
            });
        },
        error: function (err) {
            console.log(err);
        }
    });
});

function getValueFromInput(){
    let text = document.getElementById('hidden-input').value;
    return text;
}

function keyCode(event) {
    let x = event.keyCode;

    if(x) {
        let el = document.getElementById('hide-buttons');
        el.classList.remove('hide-element');
        el.classList.add('show-element');
    }
}

let text = $('#label-address').val();

$(document).on('click', '.cancel-button', function() {
    $('#hide-buttons').removeClass('show-element');
    $('#hide-buttons').addClass('hide-element');
    $('#label-address').val(text);
});

$(document).on('click', '.clickable-row', function () {
    let link = $(this).attr('data-href');
    window.location.href = link;
});