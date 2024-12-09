from models.auth_model import Role
from extensions import db

def seed_roles():
    # Seed roles if they don't already exist
    if not Role.query.filter_by(name='vårdnadshavare').first():
        guardian_role = Role(name='vårdnadshavare')
        db.session.add(guardian_role)

    if not Role.query.filter_by(name='ledare').first():
        leader_role = Role(name='ledare')
        db.session.add(leader_role)

    if not Role.query.filter_by(name='kutar').first():
        kutar_role = Role(name='kutar')
        db.session.add(kutar_role)

    if not Role.query.filter_by(name='tumlare').first():
        tumlare_role = Role(name='tumlare')
        db.session.add(tumlare_role)

    if not Role.query.filter_by(name='upptäckare').first():
        explorer_role = Role(name='upptäckare')
        db.session.add(explorer_role)

    if not Role.query.filter_by(name='äventyrare').first():
        adventurer_role = Role(name='äventyrare')
        db.session.add(adventurer_role)

    if not Role.query.filter_by(name='utmanare').first():
        challenger_role = Role(name='utmanare')
        db.session.add(challenger_role)

    if not Role.query.filter_by(name='rover').first():
        rover_role = Role(name='rover')
        db.session.add(rover_role)
    
    if not Role.query.filter_by(name='admin').first():
        admin_role = Role(name='admin')
        db.session.add(admin_role)
    
    if not Role.query.filter_by(name='vuxenscout').first():
        vuxenscout_role = Role(name='vuxenscout')
        db.session.add(vuxenscout_role)

    db.session.commit()