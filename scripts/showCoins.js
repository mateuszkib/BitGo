$('#selCoin').change(function () {
    $('#div1').html(" ");
    let selectCoin = $('#selCoin option:selected').val();
    $.ajax({
        url: "/user/wallet",
        method: "POST",
        data: { coin : selectCoin },
        success: function(resp) {
            $.each(resp.wallets, (i, item) => {
                console.log(item);
                $('#div1').append("ID portfela: " + item._wallet.id + " ,");
            });
        },
        error: function(err) {
            console.log(err);
        }
    });
});