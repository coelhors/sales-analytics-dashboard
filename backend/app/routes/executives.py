"""
Executives Routes

This module defines API endpoints for executive oversight functionality,
particularly for directors to monitor account executive performance.
"""
from flask import Blueprint, jsonify, request
from sqlalchemy import extract, func, and_, or_, distinct
from ..models.models import (
    db, User, Client, Revenue, Win, Signing,
    DirectorAccountExecutive, YearlyTarget
)
from datetime import datetime
from ..auth_utils import token_required
# Create a Blueprint for executives routes
executives_bp = Blueprint('executives', __name__, url_prefix='/api/executives')

@executives_bp.route('/account-executives', methods=['GET'])
@token_required
def get_account_executives():
    """
    Get all account executives
    
    Returns all users with the role of 'account-executive' with all their details.
    
    Response format:
    {
        "account_executives": [
            {
                "user_id": 1,
                "username": "jsmith",
                "email": "jsmith@example.com",
                "first_name": "John",
                "last_name": "Smith",
                "role": "account-executive"
            },
            ...
        ],
        "count": 10
    }
    
    Returns:
    - 200 OK with account executive data
    - 500 Internal Server Error if query execution fails
    """
    try:
        # Query all users with the role 'account-executive'
        account_executives = User.query.filter_by(role='account-executive').all()
        
        # Convert to list of dictionaries
        ae_data = [ae.to_dict() for ae in account_executives]
        
        # Return formatted response
        return jsonify({
            "account_executives": ae_data,
            "count": len(ae_data)
        }), 200
        
    except Exception as e:
        print(f"Error in get_account_executives: {str(e)}")
        return jsonify({"error": f"Failed to retrieve account executives: {str(e)}"}), 500

@executives_bp.route('/ae-performance', methods=['GET'])
@token_required
def get_ae_performance():
    """
    Get performance indicators for all account executives
    
    Returns performance metrics for each account executive for the specified year,
    including wins revenue, win count, and revenue from signings.
    Only directors can access this endpoint and see data for all AEs they manage.
    
    Query parameters:
    - username: Username of the current user (required, default: 'shogg')
    - year: Fiscal year (optional, default: 2024)
    
    Response format:
    {
        "ae_performance": [
            {
                "account_executive_id": 2,
                "account_executive_name": "John Smith",
                "wins_revenue": 850000.00,
                "win_count": 5.5,
                "signing_revenue": 750000.00
            },
            ...
        ],
        "year": 2024,
        "total_revenue": 3450000.00
    }
    """
    try:
        # Get and validate parameters
        username = request.args.get('username', 'shogg', type=str)
        year = request.args.get('year', 2024, type=int)
        
        # Get user by username and validate
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Check if user is a director
        if user.role != 'director':
            return jsonify({"error": "Access denied. Only directors can view AE performance data"}), 403
        
        # Get all account executives managed by this director
        ae_data = get_ae_performance_data(user.user_id, year)
        
        # Calculate totals
        total_revenue = sum(ae['wins_revenue'] for ae in ae_data)
        
        # Return formatted response
        return jsonify({
            "ae_performance": ae_data,
            "year": year,
            "total_revenue": round(total_revenue, 2)
        }), 200
        
    except Exception as e:
        print(f"Error in get_ae_performance: {str(e)}")
        return jsonify({"error": f"Failed to retrieve AE performance data: {str(e)}"}), 500


def get_ae_performance_data(director_id, year):
    """
    Get performance data for all account executives under a director
    
    Args:
        director_id: The ID of the director
        year: The fiscal year to calculate for
    
    Returns:
        List of dictionaries with account executive performance data
    """
    # Get all account executives managed by this director
    ae_relations = DirectorAccountExecutive.query.filter_by(director_id=director_id).all()
    ae_ids = [relation.account_executive_id for relation in ae_relations]
    
    # If no AEs found, return empty list
    if not ae_ids:
        return []
    
    # Get user details for all AEs
    ae_users = User.query.filter(User.user_id.in_(ae_ids)).all()
    ae_details = {ae.user_id: ae for ae in ae_users}
    
    # Initialize the result list
    ae_performance = []
    
    # For each AE, calculate revenue metrics
    for ae_id in ae_ids:
        # Skip if AE user not found (should not happen)
        if ae_id not in ae_details:
            continue
            
        ae_user = ae_details[ae_id]
        
        # Get total revenue generated by this AE
        wins_revenue = get_ae_revenue_generated(ae_id, year)
        
        # Get win count for this AE
        win_count = get_ae_win_count(ae_id, year)
        
        # Get total revenue from signings for this AE
        signing_revenue = get_ae_signing_revenue(ae_id, year)
        
        # Format AE name
        ae_name = f"{ae_user.first_name} {ae_user.last_name}".strip()
        
        # Add to results
        ae_performance.append({
            "account_executive_id": ae_id,
            "account_executive_name": ae_name,
            "wins_revenue": round(wins_revenue, 2),
            "win_count": win_count,
            "signing_revenue": round(signing_revenue, 2)
        })
    
    # Sort by revenue generated (descending)
    ae_performance.sort(key=lambda x: x["wins_revenue"], reverse=True)
    
    return ae_performance


def get_ae_revenue_generated(ae_id, year):
    """Get the total revenue generated by an account executive's clients"""
    # Get all clients managed by this AE
    clients = Client.query.filter_by(account_executive_id=ae_id).all()
    client_ids = [client.client_id for client in clients]
    
    # If no clients, return 0
    if not client_ids:
        return 0.0
    
    # Query the sum of revenue for these clients for the specified year
    revenue_query = db.session.query(
        func.sum(Revenue.amount)
    ).filter(
        Revenue.client_id.in_(client_ids),
        Revenue.fiscal_year == year
    )
    
    # Execute query and get result
    total_revenue = revenue_query.scalar() or 0.0
    
    return float(total_revenue)


def get_ae_win_count(ae_id, year):
    """Get the total win count (sum of win multipliers) for an account executive"""
    # Get all clients managed by this AE
    clients = Client.query.filter_by(account_executive_id=ae_id).all()
    client_ids = [client.client_id for client in clients]
    
    # If no clients, return 0
    if not client_ids:
        return 0.0
    
    # Query the sum of win multipliers for these clients for the specified year
    win_query = db.session.query(
        func.sum(Win.win_multiplier)
    ).filter(
        Win.client_id.in_(client_ids),
        Win.fiscal_year == year
    )
    
    # Execute query and get result
    total_wins = win_query.scalar() or 0.0
    
    return float(total_wins)


def get_ae_signing_revenue(ae_id, year):
    """Get the total revenue from signings for an account executive"""
    # Get all clients managed by this AE
    clients = Client.query.filter_by(account_executive_id=ae_id).all()
    client_ids = [client.client_id for client in clients]
    
    # If no clients, return 0
    if not client_ids:
        return 0.0
    
    # Query the annual contract value from signings for these clients in the specified year
    # The annual contract value is calculated by dividing total_contract_value by contract duration
    signing_query = db.session.query(
        func.sum(
            Signing.total_contract_value / 
            func.greatest(
                # Calculate the duration in years (end_date - start_date)
                (extract('year', Signing.end_date) - extract('year', Signing.start_date) + 1),
                1.0  # Ensure we don't divide by zero
            )
        )
    ).filter(
        Signing.client_id.in_(client_ids),
        Signing.fiscal_year == year
    )
    
    # Execute query and get result
    signing_revenue = signing_query.scalar() or 0.0
    
    return float(signing_revenue)