document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('searchInput');
    var productContainer = document.getElementById('productContainer');
    var productCards = Array.from(document.getElementsByClassName('product-card'));
    var noProductMessage = document.getElementById('noProductMessage');
    var allProducts = productCards.map(function(card) {
      return card.cloneNode(true);
    });
  
    searchInput.addEventListener('keyup', function() {
      var input = searchInput.value.toLowerCase();
      productContainer.innerHTML = '';
  
      if (input === '') {
        allProducts.forEach(function(card) {
          productContainer.appendChild(card);
        });
        noProductMessage.style.display = 'none';
      } else {
        var filteredCards = productCards.filter(function(card) {
          var title = card.getElementsByClassName('card-title')[0].textContent.toLowerCase();
          return title.includes(input);
        });
  
        if (filteredCards.length > 0) {
          filteredCards.forEach(function(card) {
            productContainer.appendChild(card);
          });
          noProductMessage.style.display = 'none';
        } else {
          noProductMessage.style.display = 'block';
        }
      }
    });
  });