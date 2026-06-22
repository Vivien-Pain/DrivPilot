import bcrypt from 'bcrypt';
import { pool } from './config/database';

async function fixPasswords() {
    try {
        console.log('⏳ Génération du vrai hash bcrypt pour "DrivPilot2026!"...');
        const realHash = await bcrypt.hash('DrivPilot2026!', 10);

        console.log('🔄 Mise à jour de la base de données...');
        const [result]: any = await pool.query('UPDATE users SET password_hash = ?', [realHash]);

        console.log(`✅ Succès ! ${result.affectedRows} utilisateurs mis à jour avec un hash valide.`);
        console.log('🔑 Vous pouvez maintenant vous connecter avec gerant@horizon.fr et le mot de passe DrivPilot2026!');
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour :', error);
    } finally {
        process.exit(0);
    }
}

fixPasswords();