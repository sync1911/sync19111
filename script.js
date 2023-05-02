window.fbAsyncInit = function () {
  FB.init({
      appId: '180479404930287',
      cookie: true,
      xfbml: true,
      version: 'v16.0',
  });

  FB.AppEvents.logPageView();
};



function fetchFacebookAdsData() {
  getAdAccounts()
    .then((adAccounts) => {
      displayAdAccounts(adAccounts);
    })
    .catch((error) => {
      console.error(error);
      if (error.code === 100 && error.error_subcode === 33) {
        displayError(
          'Your ad account is blocked or has insufficient permissions. Please check your Facebook ad account.'
        );
      } else {
        displayError(
          'There was an error while fetching ad accounts. Please try again later.'
        );
      }
    });
}

function getAdAccounts() {
  return new Promise((resolve, reject) => {
    FB.api('/me/adaccounts', 'GET', { fields: 'account_id,name' }, function (
      response
    ) {
      if (response && !response.error) {
        resolve(response.data);
      } else {
        reject(response.error);
      }
    });
  });
}








function displayAdAccounts(adAccounts) {
  const adAccountsList = document.getElementById('adAccountsList');

  adAccounts.forEach((adAccount) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${adAccount.name} (${adAccount.account_id})`;
    adAccounts.forEach((adAccount) => {

    // Add click event listener to select the ad account
    listItem.addEventListener('click', () => {
      // Fetch the data for the selected ad account
      fetchAdAccountData(adAccount.account_id);
      closeModal();
    });
    listItem.addEventListener('click', () => {
      console.log('Ad account clicked:', adAccount.name); // Add this line
      fetchAdAccountData(adAccount.account_id);
      closeModal();
    });
    adAccountsList.appendChild(listItem);
  });
});

  // Display the modal
  openModal();
}

function openModal() {
  const modal = document.getElementById('adAccountModal');
  modal.style.display = 'block';

  const closeButton = document.querySelector('.close');
  closeButton.addEventListener('click', closeModal);
}

function closeModal() {
  const modal = document.getElementById('adAccountModal');
  modal.style.display = 'none';
}



function processData(adAccounts) {
  const data = {
      purchaseConversionValue: 0,
      // Other variables
  };

  adAccounts.forEach((adAccount) => {
      const actions = adAccount.actions || [];

      const purchase = actions.find(
          (action) => action.action_type === 'offsite_conversion.fb_pixel_purchase'
      );

      if (purchase) {
          data.purchaseConversionValue += parseFloat(purchase.value);
      }
      // Other conditions to process other data
  });

  // Call the updateDashboardCards() function
  updateDashboardCards(data);
}

function updateDashboardCards(data) {
  // Update the "Earnings (Monthly)" card with the fetched data
  document.getElementById('monthly-earnings').innerHTML = '$' + data.purchaseConversionValue.toFixed(2);
}



function fetchAdAccountData(adAccountId) {
  fetchData(adAccountId);
}
  const fields = [
    'account_id',
    'account_name',
    'spend',
    'actions{action_type,value}',
    'outbound_clicks',
    'cost_per_outbound_click',
    'impressions',
    'clicks',
    'ctr',
    'unique_actions{action_type,value}',  
  ].join(',');

  const date_preset = 'last_90d';
  const level = 'account';
  const accessToken = FB.getAuthResponse()['accessToken'];

  FB.api(
    `/v16.0/${accountId}/insights?fields=${fields}&date_preset=${date_preset}&level=${level}&access_token=${accessToken}`,
    'GET',
    {},
    function (response) {
      if (response && !response.error) {
        console.log(response);
        processData(response);
        // Call the calculateRatesAndDisplayResults() function
        calculateRatesAndDisplayResults(data);
      } else {
        console.error(response.error);
      }
      // Apply color coding
  applyColor(conversionRate, 2, 1, "conversion-rate");
  applyColor(vcToAtc, 25, 10, "vc-to-atc");
  applyColor(atcToItc, 30, 15, "atc-to-itc");
  applyColor(itcToPur, 45, 20, "itc-to-pur");
  applyColor(qcp, 80, 60, "qcp");
    }
  );



function displayError(message) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';
  errorContainer.textContent = message;

  // Append the error container to the body
  document.body.appendChild(errorContainer);

  // Remove the error container after 5 seconds
  setTimeout(() => {
    errorContainer.remove();
  }, 5000);
}

function calculateRatesAndDisplayResults(data) {
  const totalOutboundClicks = data.outbound_clicks;
  const totalLinkClicks = data.clicks;
  const totalContentViews = data.content_views;
  const totalAddToCart = data.add_to_cart;
  const totalInitiateCheckouts = data.initiate_checkout;
  const totalPurchases = data.purchases;

  const conversionRate = (totalPurchases / totalOutboundClicks) * 100;
  const vcToAtc = (totalAddToCart / totalContentViews) * 100;
  const atcToItc = (totalInitiateCheckouts / totalAddToCart) * 100;
  const itcToPur = (totalPurchases / totalInitiateCheckouts) * 100;
  const qcp = (totalOutboundClicks / totalLinkClicks) * 100;

  // Display the rates on the website (You can update the element IDs as needed)
  document.getElementById("conversion-rate").innerHTML = conversionRate.toFixed(2) + "%";
  document.getElementById("vc-to-atc").innerHTML = vcToAtc.toFixed(2) + "%";
  document.getElementById("atc-to-itc").innerHTML = atcToItc.toFixed(2) + "%";
  document.getElementById("itc-to-pur").innerHTML = itcToPur.toFixed(2) + "%";
  document.getElementById("qcp").innerHTML = qcp.toFixed(2) + "%";
}


function applyColor(value, greenThreshold, yellowThreshold, elementId) {
  const element = document.getElementById(elementId);

  if (value >= greenThreshold) {
    element.style.color = "green";
  } else if (value >= yellowThreshold) {
    element.style.color = "yellow";
  } else {
    element.style.color = "red";
  }
}




$(document).ready(function () {
  $("#chat-input-form").on("submit", function (event) {
      event.preventDefault();

      let userInput = $("#user-input").val().trim();
      if (!userInput) return;

      $("#chat-output").append(`<div class="user-message">${userInput}</div>`);

      $.post("/chat", { user_input: userInput }, function (data) {
          $("#chat-output").append(`<div class="ai-response">${data.ai_response}</div>`);
      });

      $("#user-input").val("");
  });
});


function statusChangeCallback(response) {
  if (response.status === 'connected') {
      // Logged into your app and Facebook.
      window.location.href = "/static/dashboard.html";
  } else {
      // The person is not logged into your app or we are unable to tell.
      console.log("Not logged in");
  }
}

(function (d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");



function facebookLogin() {
  FB.login(
    function (response) {
      if (response.status === "connected") {
        console.log("Logged in successfully");
        fetchFacebookAdsData();
        console.log('Access Token:', FB.getAuthResponse().accessToken);
      } else {
        console.log("User cancelled login or did not fully authorize.");
      }
    },
    { scope: "public_profile,email,ads_management,ads_read" }
  );
}

<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>

function checkPermissions() {
  FB.api('/me/permissions', function (response) {
    var permissions = response.data;
    console.log(permissions);

    var hasAdsManagementPermission = permissions.some(function (permission) {
      return permission.permission === 'ads_management' && permission.status === 'granted';
    });

    var hasAdsReadPermission = permissions.some(function (permission) {
      return permission.permission === 'ads_read' && permission.status === 'granted';
    });

    if (!hasAdsManagementPermission || !hasAdsReadPermission) {
      console.log('Missing required permissions.');
      // Request the user to grant the necessary permissions
      FB.login(function (response) {
        // Handle the response
      }, { scope: 'ads_management,ads_read' });
    } else {
      console.log('User has granted the required permissions.');
      // Continue with your logic
    }
  });
}
