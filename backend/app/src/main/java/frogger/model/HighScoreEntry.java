package frogger.model;

public class HighScoreEntry {
    private final int    score;
    private final String date;

    public HighScoreEntry(int score, String date) {
        this.score = score;
        this.date  = date;
    }

    public int    getScore() { return score; }
    public String getDate()  { return date;  }
}