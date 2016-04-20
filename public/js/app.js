$(document).ready(function () {
    if ($("div.itemBlock").length) {
        $('div.itemBlock').each(function (index, itemBlock) {
            $.ajax({
                url: "/getItem?iId=" + $(itemBlock).attr('id'),
                dataType: "json"
            }).success(function (data) {
                $(itemBlock).html(
                    '<img class="img-responsive" src="http://www.bungie.net/' + data.Response.data.inventoryItem.icon + '"/>' +
                '<div class="itemName">' + data.Response.data.inventoryItem.itemName + '</div>'
                );
            });
        });
    }
    
    $(".dropdown-menu li a").click(function () {
        $(this).parent().parent().parent().find('button.btn').html($(this).text() + ' <span class="caret"></span>');
        $(this).parent().parent().parent().find('button.btn').val($(this).text());
    });
    
    var categoryObj = {
        weapon: 1,
        armor: 20
    };
    var categories = GetURLParameter('categories');
    var page = GetURLParameter('page');
    var rarity = GetURLParameter('rarity');
    
    if (categories != undefined) {
        for (var cat in categoryObj) {
            if (categoryObj[cat] == categories) {
                $('#category button.btn').html(properCase(cat) + ' <span class="caret"></span>');
                $('#category button.btn').val(cat);
            }
        }
    }
    
    if (rarity != undefined) {
        $('#rarity button.btn').html(properCase(rarity) + ' <span class="caret"></span>');
        $('#rarity button.btn').val(rarity);
    }
    
    if (page == undefined)
        page = 0;
    
    $('div#nav span.prev').click(function () {
        var prevPage = parseInt(page) - 1;
        if (prevPage >= 0) {
            var url = buildURL(categories, rarity, prevPage);
            window.location = url;
        }
    });
    $('div#nav span.next').click(function () {
        var nextPage = parseInt(page) + 1;
        if (nextPage < pageSize) {
            var url = buildURL(categories, rarity, nextPage);
            window.location = url;
        }
    });
    $('li.category').click(function () {
        var categoryID = $(this).data('category');
        var categories = categoryObj[categoryID];
        var url = buildURL(categories, rarity, 0);
        window.location = url;
    });
    $('li.rarity').click(function () {
        var rarity = $(this).data('rarity');
        var url = buildURL(categories, rarity, 0);
        window.location = url;
    });
    $('li.playerType').click(function () {
        var playerType = $(this).data('playertype');
        var player = $('input#player').val();
        if (player != undefined) {
            var url = '//' + window.location.host + '/search?memType=' + playerType + '&player=' + player;
            window.location = url;
        }
        else {
            alert('Please enter a player to search for...');
        }
    });
});

function properCase(val) {
    return val.charAt(0).toUpperCase() + val.substr(1).toLowerCase();
}

function GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function buildURL(categories, rarity, page) {
    var url = '//' + window.location.host + '?';
    if (categories != undefined)
        url += '&categories=' + categories;
    if (rarity != undefined)
        url += '&rarity=' + rarity;
    url = url + '&page=' + page;
    return url;
}