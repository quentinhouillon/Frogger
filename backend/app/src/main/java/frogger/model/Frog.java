package frogger.model;

/**
 * La grenouille.
 *
 * Mouvement :
 *  - jump(dx, dy) : saut discret de JUMP_SIZE pixels, déclenché par chaque message WebSocket.
 *  - drift(driftX) : dérive horizontale continue, appliquée par CollisionManager quand
 *                    la grenouille est portée par un tronc ou une tortue.
 *
 * Plus de direction/vitesse continue : tout passe par les sauts.
 */
public class Frog extends Entity {

    /** Taille d'un saut = hauteur d'une lane. */
    public static final int JUMP_SIZE = 50;

    public enum FrogState {
        LIVING,
        DEAD,
        WIN
    }

    private FrogState state;

    public Frog(float x, float y, int width, int height) {
        super(x, y, width, height);
        this.state = FrogState.LIVING;
    }

    /**
     * Déplace la grenouille d'un saut discret.
     * Appelé une fois par message reçu (UP / DOWN / LEFT / RIGHT).
     *
     * @param dx -1 (gauche), 0 ou +1 (droite)
     * @param dy -1 (haut),   0 ou +1 (bas)
     */
    public void jump(int dx, int dy) {
        if (state != FrogState.LIVING) return;
        super.setX(super.getX() + dx * JUMP_SIZE);
        super.setY(super.getY() + dy * JUMP_SIZE);
    }

    /**
     * Dérive horizontale continue.
     * Appelé à chaque frame par CollisionManager quand la grenouille
     * est sur un tronc ou une tortue.
     *
     * @param driftX déplacement en pixels pour cette frame
     */
    public void drift(float driftX) {
        if (state != FrogState.LIVING) return;
        super.setX(super.getX() + driftX);
    }

    public FrogState getState()           { return state; }
    public void      setState(FrogState s){ this.state = s; }
}
