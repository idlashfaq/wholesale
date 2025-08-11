const sheetId = '1nG4mfu5wokKharasKnLjDl5-WA8ICfhJjjTPtcUs3hg';

function fetchProducts() {
    const gid = '0'; // usually 0 for first sheet
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    fetch(url)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
    })
    .then(csvText => {      
        const rows = csvText.trim().split('\n');
        const headers = rows.shift().split(',');
    
        const data = rows.map(row => {
            const values = row.split(',');
            let obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i];
            });
            return obj;
        });
    
        
        const laysContainer = document.getElementById('lays');
        laysContainer.innerHTML = '';
    
        data.forEach(product => {
            console.log(product);
            const productHTML = `
                <div class="col-md-4">
                    <div class="card product h-100 p-2 text-center" 
                        data-name="${product.name}" 
                        data-price="${product.box_price}" 
                        data-pieces="${product.total_pieces}">
                        <img src="${product.product_image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="fw-bold">Box Price: PKR ${product.box_price}</p>
                            <p>Wholesale Price per piece: PKR <span class="piece-price">${(product.box_price / product.total_pieces).toFixed(2)}</span></p>
                            <p>Retail Price per piece: PKR <span class="retail-price">${product.retail_price}</span></p>
                            <div class="qty-holder">
                                <input type="number" class="form-control quantity" value="1" min="1">
                                <small class="stocks_available">Available Stock: ${product.stock}</small>
                            </div>
                            <a href="#" class="btn btn-success w-100" onclick="orderNow(this)">Order on WhatsApp</a>
                        </div>
                    </div>
                </div>
            `;
            laysContainer.insertAdjacentHTML('beforeend', productHTML);
        });
    
    })
    .catch(error => {
        console.error('Error fetching sheet data:', error);
    });
}

fetchProducts();


function fetchLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                userLocation = `Lat: ${lat}, Lng: ${lng}`;
                alert(userLocation);
            },
            error => {
                userLocation = 'Location permission denied or unavailable';
                alert(userLocation);
            }
        );
    } else {
        userLocation = 'Geolocation not supported';
        alert(userLocation);
    }
}

//window.onload = fetchLocation;

let finalOrderURL = "";
function orderNow(button) {
    let shopName = document.getElementById('shopNameInput').value.trim() || localStorage.getItem("shop_name");

    if(shopName) {
        localStorage.setItem("shop_name", shopName);
    }

    if (!shopName && localStorage.getItem("shop_name") == undefined) {
        alert("Please enter your shop name");
        return;
    }

    let product = button.closest('.product');
    let name = product.dataset.name;
    let pricePerBox = parseInt(product.dataset.price);
    let piecesInBox = parseInt(product.dataset.pieces);
    let qty = parseInt(product.querySelector('.quantity').value);
    let perPiecePrice = (pricePerBox / piecesInBox).toFixed(2);
    let totalPrice = pricePerBox * qty;

    let message = `*Shop Name: ${shopName}*\n\nOrder Details:\nProduct: ${name}\nBox Price: PKR ${pricePerBox}\nPieces in Box: ${piecesInBox}\nPrice per Piece: PKR ${perPiecePrice}\nTotal Boxes: ${qty}\nTotal Price: PKR ${totalPrice}`;
    finalOrderURL = `https://wa.me/+923024069411?text=${encodeURIComponent(message)}`;

    // Fill modal content
    document.getElementById("orderSummary").innerHTML = `
        <strong>Shop Name:</strong> ${shopName}<br>
        <strong>Product:</strong> ${name}<br>
        <strong>Box Price:</strong> PKR ${pricePerBox}<br>
        <strong>Pieces in Box:</strong> ${piecesInBox}<br>
        <strong>Price per Piece:</strong> PKR ${perPiecePrice}<br>
        <strong>Total Boxes:</strong> ${qty}<br>
        <strong>Total Price:</strong> PKR ${totalPrice}<br>
    `;

    // Show modal
    new bootstrap.Modal(document.getElementById('orderConfirmModal')).show();
}
// Confirm button click
document.getElementById("confirmOrderBtn").addEventListener("click", function() {
    window.open(finalOrderURL, '_blank');
    bootstrap.Modal.getInstance(document.getElementById('orderConfirmModal')).hide();
});

document.getElementById('search').addEventListener('keyup', function() {
    let searchValue = this.value.toLowerCase();
    document.querySelectorAll('.tab-content:not([style*="display: none"]) .product').forEach(function(product) {
        let name = product.dataset.name.toLowerCase();
        product.parentElement.style.display = name.includes(searchValue) ? '' : 'none';
    });
});

document.querySelectorAll('#productTabs .nav-link').forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('#productTabs .nav-link').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        document.getElementById(tab.dataset.tab).style.display = 'flex';
    });
});