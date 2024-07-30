
$(document).ready(function () {
    $("#form1").on("input", function () {
        var searchText = $(this).val().toLowerCase();

        $(".card_common").each(function () {
            var card = $(this);
            var cardTitle = card.find(".card-title").text().toLowerCase();
            var cardText = card.find(".card-text").text().toLowerCase();

            var isMatch = cardTitle.includes(searchText) || cardText.includes(searchText);
            card.toggle(isMatch);
        });
    });
});

