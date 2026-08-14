package main

import "testing"

func TestNewFiddleIDShapeAndUniqueness(t *testing.T) {
	seen := map[string]bool{}
	for i := 0; i < 500; i++ {
		id, err := newFiddleID()
		if err != nil {
			t.Fatalf("id generation failed: %v", err)
		}
		if !validFiddleID(id) {
			t.Fatalf("generated id %q does not validate", id)
		}
		if seen[id] {
			t.Fatalf("duplicate id in 500 draws: %q", id)
		}
		seen[id] = true
	}
}

func TestValidFiddleID(t *testing.T) {
	for _, bad := range []string{"", "short", "toolongid", "abc-def", "abc0def", "abcOdef", "abcIdef", "abcldef", "../../x"} {
		if validFiddleID(bad) {
			t.Errorf("expected %q to be rejected", bad)
		}
	}
	id, _ := newFiddleID()
	if !validFiddleID(id) {
		t.Errorf("expected generated id %q to validate", id)
	}
}

func TestParseRev(t *testing.T) {
	var n int
	if _, err := parseRev("7", &n); err != nil || n != 7 {
		t.Fatalf("parseRev(7) = %d, %v", n, err)
	}
	for _, bad := range []string{"", "abc", "-1", "1e3", "9999"} {
		if _, err := parseRev(bad, &n); err == nil {
			t.Errorf("expected %q to be rejected", bad)
		}
	}
}
