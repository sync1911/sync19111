import os
from flask import Flask, render_template, request, redirect, url_for, session
import facebook
from functools import wraps
from aspendos_framework import analyze_metrics
from flask import Flask, redirect, url_for
from flask_dance.contrib.facebook import make_facebook_blueprint, facebook
from facebook_business.api import FacebookAdsApi
import facebook
from analyze_metrics import analyze_metrics
import openai
from flask import jsonify, request


OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

openai.api_key = OPENAI_API_KEY

@app.route('/chat', methods=['GET', 'POST'])
def chat():
    if request.method == 'POST':
        user_input = request.form['user_input']
        response = openai.Completion.create(
            engine="davinci-codex",
            prompt=f"{user_input}\n\nWhat can you suggest to improve their online store or Facebook Ads campaigns?",
            temperature=0.5,
            max_tokens=100,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        ai_response = response.choices[0].text.strip()
        return jsonify({'ai_response': ai_response})
    return render_template('chat.html')

@app.route('/chat')
def chat():
    metrics = request.args.get('metrics')
    rates = request.args.get('rates')
    colors = request.args.get('colors')

    return render_template('chat.html', metrics=metrics, rates=rates, colors=colors)

app = Flask(__name__)

FB_APP_ID = os.environ.get('FB_APP_ID')
FB_APP_SECRET = os.environ.get('FB_APP_SECRET')
FB_ACCESS_TOKEN = os.environ.get('FB_ACCESS_TOKEN')

graph = facebook.GraphAPI(access_token=FB_ACCESS_TOKEN, version="3.0")

def get_ad_account_id():
    accounts = graph.get_connections(id='me', connection_name='adaccounts')['data']
    return accounts[0]['id']

def get_facebook_metrics():
    ad_account_id = get_ad_account_id()
    params = {
        'fields': 'account_id,account_name,spend,impressions,clicks,link_clicks,actions,reach',
        'level': 'account',
        'date_preset': 'last_90d'
    }
    response = graph.get_connections(id=ad_account_id, connection_name='insights', **params)
    metrics = response['data'][0]
    
    # Process the metrics and create a dictionary with the required metrics
    processed_metrics = {
        "Total Outbound Clicks": metrics["clicks"],
        "Total Link Clicks": metrics["link_clicks"],
        "Total Sales": metrics["actions"]["purchase"],
        "Total Content Views": metrics["actions"]["content_view"],
        "Total Add to Cart": metrics["actions"]["add_to_cart"],
        "Total Initiate Checkouts": metrics["actions"]["initiate_checkout"],
        "Total Purchases": metrics["actions"]["purchase"]
    }

    return processed_metrics

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/facebook_login")
def facebook_login():
    if not facebook.authorized:
        return redirect(url_for("facebook.login"))
    resp = facebook.get("/me")
    return f"Hello, {resp.json()['name']}!"


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

@app.route('/analytics')
@login_required
def analytics():
    metrics = {
        "Total Outbound Clicks": ...,
        "Total Link Clicks": ...,
        "Total Sales": ...,
        "Total Content Views": ...,
        "Total Add to Cart": ...,
        "Total Initiate Checkouts": ...,
        "Total Purchases": ...
    }

    rates, colors = analyze_metrics(metrics)
    return render_template('analytics.html', rates=rates, colors=colors)


@app.route('/dashboard')
def dashboard():
    metrics = get_facebook_metrics()
    rates, colors = analyze_metrics(metrics)
    return render_template('dashboard.html', metrics=metrics, rates=rates, colors=colors)

if __name__ == "__main__":
    app.run(debug=True)