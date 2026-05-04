package frogger.model;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.*;
import java.lang.reflect.Type;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class HighScoreRepository {

    private static final String FILE_PATH  = "scores.json";
    private static final int    MAX_SCORES = 5;
    private static final Gson   gson       = new Gson();

    public static List<HighScoreEntry> load() {
        File file = new File(FILE_PATH);
        if (!file.exists()) return new ArrayList<>();
        try (Reader reader = new FileReader(file)) {
            Type type = new TypeToken<ArrayList<HighScoreEntry>>() {}.getType();
            List<HighScoreEntry> scores = gson.fromJson(reader, type);
            return scores != null ? scores : new ArrayList<>();
        } catch (IOException e) {
            System.err.println("Impossible de lire scores.json : " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /** Ajoute le score, trie, garde le top MAX_SCORES, persiste et retourne la liste. */
    public static List<HighScoreEntry> save(int newScore) {
        List<HighScoreEntry> scores = new ArrayList<>(load());
        scores.add(new HighScoreEntry(newScore, LocalDate.now().toString()));
        scores.sort(Comparator.comparingInt(HighScoreEntry::getScore).reversed());
        if (scores.size() > MAX_SCORES) scores = scores.subList(0, MAX_SCORES);

        try (Writer writer = new FileWriter(FILE_PATH)) {
            gson.toJson(scores, writer);
        } catch (IOException e) {
            System.err.println("Impossible d'écrire scores.json : " + e.getMessage());
        }
        return new ArrayList<>(scores);
    }
}
