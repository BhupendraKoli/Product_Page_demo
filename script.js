
const $ = (selector) => document.querySelector(selector);

// Demo product data: replace with actual product data.
const product = {
  name: "Semi Automatic Disc Filter",
  brand: "Heera Agro Industries",
  description:
    "Sample product description. Replace with verified product information.",
  images: [
    "Disc.jpg",
    "Disc.jpg",
    "Disc.jpg"
  ],
  variants: [
    { name: "2''", sku: "WP-S", price: 4500, mrp: 4500, power: "Confirm specification" },
    { name: "2.5''", sku: "WP-M", price: 5500, mrp: 5500, power: "Confirm specification" },
    { name: "3''", sku: "WP-L", price: 6100, mrp: 6100, power: "Confirm specification" }
  ],
  colors: ["Black", "Blue", "Green"]
};

let selectedVariant = product.variants[1];
let selectedColor = product.colors[0];
let cartCount = 0;
let toastTimer;

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// Render size/model options.
function renderVariants() {
  const container = $("#variantOptions");
  container.replaceChildren();

  product.variants.forEach((variant) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "variant-btn" +
      (variant.sku === selectedVariant.sku ? " selected" : "");
    button.textContent = variant.name;
    button.setAttribute(
      "aria-pressed",
      String(variant.sku === selectedVariant.sku)
    );

    button.addEventListener("click", () => {
      selectedVariant = variant;
      renderVariants();
      updateProduct();
    });

    container.appendChild(button);
  });
}

// Render color options.
function renderColors() {
  const container = $("#colorOptions");
  container.replaceChildren();

  product.colors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "color-btn" + (color === selectedColor ? " selected" : "");
    button.textContent = color;
    button.setAttribute(
      "aria-pressed",
      String(color === selectedColor)
    );

    button.addEventListener("click", () => {
      selectedColor = color;
      renderColors();
      updateTechnicalDetails();
    });

    container.appendChild(button);
  });
}

// Keep price, SKU and technical details in sync.
function updateProduct() {
  const variant = selectedVariant;
  const saving = variant.mrp - variant.price;
  const discount = Math.round((saving / variant.mrp) * 100);

  $("#productName").textContent = product.name;
  $("#brandName").textContent = product.brand;
  $("#price").textContent = money(variant.price);
  $("#oldPrice").textContent = money(variant.mrp);
  $("#discount").textContent =
    saving > 0 ? `${discount}% off` : "";
  $("#sku").textContent = `SKU: ${variant.sku}`;
  $("#variantInfo").textContent =
    `${variant.name} · ${selectedColor} · ${money(variant.price)}`;

  updateTechnicalDetails();
  updateProductSchema();
}

function updateTechnicalDetails() {
  const rows = [
    ["Product name", product.name],
    ["Brand", product.brand],
    ["SKU", selectedVariant.sku],
    ["Selected model / size", selectedVariant.name],
    ["Selected colour", selectedColor],
    ["Category", "Agricultural Equipment"],
    ["Price", money(selectedVariant.price)],
    ["Specifications", selectedVariant.power],
    ["Condition", "New"],
    ["Warranty", "Confirm actual warranty"],
    ["Country of origin", "Confirm actual origin"],
    ["Package contents", "Confirm actual contents"]
  ];

  const tbody = $("#technicalTable");
  tbody.replaceChildren();

  rows.forEach(([label, value]) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    const td = document.createElement("td");

    th.textContent = label;
    td.textContent = value;
    tr.append(th, td);
    tbody.appendChild(tr);
  });
}

// Keep the structured data aligned with the selected variant.
// Replace the example URL and policy values before publishing.
function updateProductSchema() {
  const url = "https://example.com/products/water-pump";
  const variant = selectedVariant;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product-${variant.sku}`,
    name: `${product.name} - ${variant.name}`,
    url,
    description: product.description,
    image: product.images,
    sku: variant.sku,
    brand: {
      "@type": "Brand",
      name: product.brand
    },
    category: "Agricultural Equipment",
    color: selectedColor,
    size: variant.name,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: String(variant.price),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Your Store"
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR"
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN"
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "DAY"
          }
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn"
      }
    }
  };

  $("#productSchema").textContent = JSON.stringify(schema);
}

// Gallery.
document.querySelectorAll(".thumb").forEach((button) => {
  button.addEventListener("click", () => {
    $("#mainImage").src = button.dataset.image;
    $("#mainImage").alt = product.name;

    document.querySelectorAll(".thumb").forEach((thumb) => {
      thumb.classList.remove("active");
    });

    button.classList.add("active");
  });
});

// Read More / Read Less.
$("#readMoreBtn").addEventListener("click", () => {
  const content = $("#fullDescription");
  const expanded = $("#readMoreBtn").getAttribute("aria-expanded") === "true";

  content.hidden = expanded;
  $("#readMoreBtn").setAttribute("aria-expanded", String(!expanded));
  $("#readMoreBtn").textContent =
    expanded ? "Read More ↓" : "Read Less ↑";
});

// Quantity.
function getQuantity() {
  const number = Number.parseInt($("#quantity").value, 10);
  return Number.isFinite(number)
    ? Math.max(1, Math.min(99, number))
    : 1;
}

$("#minusQty").addEventListener("click", () => {
  $("#quantity").value = Math.max(1, getQuantity() - 1);
});

$("#plusQty").addEventListener("click", () => {
  $("#quantity").value = Math.min(99, getQuantity() + 1);
});

$("#quantity").addEventListener("change", () => {
  $("#quantity").value = getQuantity();
});

// Demo cart only. A real cart requires backend or persistence.
$("#addCart").addEventListener("click", () => {
  cartCount += getQuantity();
  $("#cartCount").textContent = cartCount;
  showToast(`${selectedVariant.name} added to demo cart.`);
});

$("#cartButton").addEventListener("click", () => {
  showToast(`Demo cart: ${cartCount} item(s).`);
});

$("#buyNow").addEventListener("click", () => {
  showToast("Connect a checkout and payment gateway to place an order.");
});

// Share: native device sharing, with clipboard fallback.
$("#shareButton").addEventListener("click", async () => {
  const shareData = {
    title: product.name,
    text: `Check out ${product.name}`,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareData.url);
      showToast("Product link copied!");
    } else {
      window.prompt("Copy this product link:", shareData.url);
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      showToast("Sharing was not completed. Try copying the page URL.");
    }
  }
});

// PIN validation: demo behaviour, NOT actual courier verification.
$("#checkDelivery").addEventListener("click", () => {
  const pin = $("#pincode").value.trim();
  const message = $("#deliveryMessage");

  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    message.textContent = "Please enter a valid 6-digit Indian PIN code.";
    message.style.color = "#c62828";
    return;
  }

  message.textContent =
    `Demo: delivery available for PIN ${pin}. Actual courier serviceability must be verified.`;
  message.style.color = "#168344";
});

// Search within the current page.
$("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const query = $("#searchInput").value.trim().toLowerCase();

  if (!query) {
    showToast("Enter a product name to search.");
    return;
  }

  const content = [
    $("#productName").textContent,
    $("#shortDescription").textContent,
    $("#fullDescription").textContent,
    $("#technicalTable").textContent
  ].join(" ").toLowerCase();

  if (content.includes(query)) {
    $("#product").scrollIntoView({ behavior: "smooth" });
    showToast("Product information found.");
  } else {
    showToast("No matching information on this page.");
  }
});

// Initial render.
renderVariants();
renderColors();
updateProduct();
