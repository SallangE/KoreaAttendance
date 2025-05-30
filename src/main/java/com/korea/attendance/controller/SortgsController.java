package com.korea.attendance.controller;

import com.korea.attendance.util.SortgsRunner;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sortgs")
public class SortgsController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> runSortgs(
            @RequestParam(name = "query") String query,
            @RequestParam(name = "nresults", defaultValue = "100") int nresults
    ) {
        List<Map<String, Object>> results = SortgsRunner.runSortgs(query, nresults);
        return ResponseEntity.ok(results);
    }
}
