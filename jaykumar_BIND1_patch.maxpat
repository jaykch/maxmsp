{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 8,
      "minor": 6,
      "revision": 0,
      "architecture": "x64",
      "modernui": 1
    },
    "rect": [
      0.0,
      0.0,
      1200.0,
      600.0
    ],
    "bglocked": 0,
    "openinpresentation": 1,
    "default_fontsize": 12.0,
    "default_fontface": 0,
    "default_fontname": "Arial",
    "gridonopen": 1,
    "gridsize": [
      15.0,
      15.0
    ],
    "gridsnaponopen": 1,
    "toolbarvisible": 1,
    "boxanimatetime": 200,
    "imprint": 0,
    "enablehscroll": 1,
    "enablevscroll": 1,
    "devicespecific": 0,
    "boxes": [
      {
        "box": {
          "id": "obj-1",
          "maxclass": "comment",
          "text": "BIND1 Conceptual Collaboration Patch — Stereo Rhythm Gate + Filter + Delay (Jay Kumar)",
          "patching_rect": [
            20.0,
            20.0,
            720.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-2",
          "maxclass": "comment",
          "text": "Drop this on an audio track. Controls are in Presentation. Exported patch is .maxpat.",
          "patching_rect": [
            20.0,
            42.0,
            720.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-3",
          "maxclass": "inlet~",
          "patching_rect": [
            20.0,
            110.0,
            25.0,
            25.0
          ],
          "comment": "Audio In L"
        }
      },
      {
        "box": {
          "id": "obj-4",
          "maxclass": "inlet~",
          "patching_rect": [
            60.0,
            110.0,
            25.0,
            25.0
          ],
          "comment": "Audio In R"
        }
      },
      {
        "box": {
          "id": "obj-5",
          "maxclass": "outlet~",
          "patching_rect": [
            860.0,
            130.0,
            25.0,
            25.0
          ],
          "comment": "Audio Out L"
        }
      },
      {
        "box": {
          "id": "obj-6",
          "maxclass": "outlet~",
          "patching_rect": [
            860.0,
            170.0,
            25.0,
            25.0
          ],
          "comment": "Audio Out R"
        }
      },
      {
        "box": {
          "id": "obj-7",
          "maxclass": "comment",
          "text": "Gate Rate (Hz)",
          "patching_rect": [
            20.0,
            70.0,
            110.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            20.0,
            20.0,
            110.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-8",
          "maxclass": "live.dial",
          "patching_rect": [
            20.0,
            90.0,
            60.0,
            60.0
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Gate Rate (Hz)",
              "parameter_shortname": "Rate",
              "parameter_mmax": 16.0,
              "parameter_mmin": 0.125,
              "parameter_type": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            20.0,
            40.0,
            60.0,
            60.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-9",
          "maxclass": "live.numbox",
          "patching_rect": [
            90.0,
            108.0,
            60.0,
            20.0
          ],
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            90.0,
            60.0,
            60.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-10",
          "maxclass": "comment",
          "text": "Gate Depth",
          "patching_rect": [
            170.0,
            70.0,
            90.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            170.0,
            20.0,
            90.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-11",
          "maxclass": "live.dial",
          "patching_rect": [
            170.0,
            90.0,
            60.0,
            60.0
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Gate Depth",
              "parameter_shortname": "Depth",
              "parameter_mmax": 1.0,
              "parameter_mmin": 0.0,
              "parameter_type": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            170.0,
            40.0,
            60.0,
            60.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-12",
          "maxclass": "live.numbox",
          "patching_rect": [
            240.0,
            108.0,
            60.0,
            20.0
          ],
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            240.0,
            60.0,
            60.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-13",
          "maxclass": "comment",
          "text": "Filter Cutoff (Hz)",
          "patching_rect": [
            320.0,
            70.0,
            140.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            320.0,
            20.0,
            140.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-14",
          "maxclass": "live.dial",
          "patching_rect": [
            320.0,
            90.0,
            60.0,
            60.0
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Filter Cutoff (Hz)",
              "parameter_shortname": "Cutoff",
              "parameter_mmax": 12000.0,
              "parameter_mmin": 80.0,
              "parameter_type": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            320.0,
            40.0,
            60.0,
            60.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-15",
          "maxclass": "live.numbox",
          "patching_rect": [
            390.0,
            108.0,
            80.0,
            20.0
          ],
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            390.0,
            60.0,
            80.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-16",
          "maxclass": "comment",
          "text": "Resonance",
          "patching_rect": [
            500.0,
            70.0,
            80.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            500.0,
            20.0,
            80.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-17",
          "maxclass": "live.dial",
          "patching_rect": [
            500.0,
            90.0,
            60.0,
            60.0
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Resonance",
              "parameter_shortname": "Res",
              "parameter_mmax": 4.0,
              "parameter_mmin": 0.5,
              "parameter_type": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            500.0,
            40.0,
            60.0,
            60.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-18",
          "maxclass": "live.numbox",
          "patching_rect": [
            570.0,
            108.0,
            60.0,
            20.0
          ],
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            570.0,
            60.0,
            60.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-19",
          "maxclass": "comment",
          "text": "Delay Time (ms)",
          "patching_rect": [
            650.0,
            70.0,
            120.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            650.0,
            20.0,
            120.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-20",
          "maxclass": "live.dial",
          "patching_rect": [
            650.0,
            90.0,
            60.0,
            60.0
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Delay Time (ms)",
              "parameter_shortname": "Time",
              "parameter_mmax": 800.0,
              "parameter_mmin": 10.0,
              "parameter_type": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            650.0,
            40.0,
            60.0,
            60.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-21",
          "maxclass": "live.numbox",
          "patching_rect": [
            720.0,
            108.0,
            60.0,
            20.0
          ],
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            720.0,
            60.0,
            60.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-22",
          "maxclass": "comment",
          "text": "Feedback",
          "patching_rect": [
            800.0,
            70.0,
            80.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            800.0,
            20.0,
            80.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-23",
          "maxclass": "live.dial",
          "patching_rect": [
            800.0,
            90.0,
            60.0,
            60.0
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Feedback",
              "parameter_shortname": "FB",
              "parameter_mmax": 0.95,
              "parameter_mmin": 0.0,
              "parameter_type": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            800.0,
            40.0,
            60.0,
            60.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-24",
          "maxclass": "live.numbox",
          "patching_rect": [
            870.0,
            108.0,
            60.0,
            20.0
          ],
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            870.0,
            60.0,
            60.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-25",
          "maxclass": "comment",
          "text": "Wet/Dry",
          "patching_rect": [
            960.0,
            70.0,
            80.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            960.0,
            20.0,
            80.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-26",
          "maxclass": "live.dial",
          "patching_rect": [
            960.0,
            90.0,
            60.0,
            60.0
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Wet/Dry",
              "parameter_shortname": "Mix",
              "parameter_mmax": 1.0,
              "parameter_mmin": 0.0,
              "parameter_type": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            960.0,
            40.0,
            60.0,
            60.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-27",
          "maxclass": "live.numbox",
          "patching_rect": [
            1030.0,
            108.0,
            60.0,
            20.0
          ],
          "parameter_enable": 0,
          "presentation": 1,
          "presentation_rect": [
            1030.0,
            60.0,
            60.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-28",
          "maxclass": "*~",
          "text": "*~ 1.",
          "patching_rect": [
            120.0,
            120.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-29",
          "maxclass": "*~",
          "text": "*~ 1.",
          "patching_rect": [
            120.0,
            160.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-30",
          "maxclass": "*~",
          "text": "*~",
          "patching_rect": [
            220.0,
            120.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-31",
          "maxclass": "*~",
          "text": "*~",
          "patching_rect": [
            220.0,
            160.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-32",
          "maxclass": "phasor~",
          "patching_rect": [
            220.0,
            220.0,
            60.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-33",
          "maxclass": ">~",
          "text": ">~ 0.5",
          "patching_rect": [
            290.0,
            220.0,
            60.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-34",
          "maxclass": "slide~",
          "text": "slide~ 50 50",
          "patching_rect": [
            360.0,
            220.0,
            90.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-35",
          "maxclass": "*~",
          "text": "*~",
          "patching_rect": [
            460.0,
            220.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-36",
          "maxclass": "!-~",
          "text": "!-~ 1.",
          "patching_rect": [
            510.0,
            220.0,
            55.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-37",
          "maxclass": "+~",
          "text": "+~",
          "patching_rect": [
            570.0,
            220.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-38",
          "maxclass": "svf~",
          "patching_rect": [
            320.0,
            120.0,
            60.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-39",
          "maxclass": "svf~",
          "patching_rect": [
            320.0,
            160.0,
            60.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-40",
          "maxclass": "tapin~",
          "text": "tapin~ 2000.",
          "patching_rect": [
            430.0,
            120.0,
            80.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-41",
          "maxclass": "tapout~",
          "patching_rect": [
            520.0,
            120.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-42",
          "maxclass": "*~",
          "patching_rect": [
            600.0,
            120.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-43",
          "maxclass": "+~",
          "patching_rect": [
            650.0,
            120.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-44",
          "maxclass": "tapin~",
          "text": "tapin~ 2000.",
          "patching_rect": [
            430.0,
            160.0,
            80.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-45",
          "maxclass": "tapout~",
          "patching_rect": [
            520.0,
            160.0,
            70.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-46",
          "maxclass": "*~",
          "patching_rect": [
            600.0,
            160.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-47",
          "maxclass": "+~",
          "patching_rect": [
            650.0,
            160.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-48",
          "maxclass": "*~",
          "patching_rect": [
            710.0,
            120.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-49",
          "maxclass": "*~",
          "patching_rect": [
            710.0,
            160.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-50",
          "maxclass": "*~",
          "patching_rect": [
            710.0,
            260.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-51",
          "maxclass": "*~",
          "patching_rect": [
            710.0,
            300.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-52",
          "maxclass": "+~",
          "patching_rect": [
            780.0,
            130.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-53",
          "maxclass": "+~",
          "patching_rect": [
            780.0,
            170.0,
            45.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-54",
          "maxclass": "sig~",
          "patching_rect": [
            160.0,
            235.0,
            40.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-55",
          "maxclass": "sig~",
          "patching_rect": [
            160.0,
            270.0,
            40.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-56",
          "maxclass": "message",
          "text": "freq $1",
          "patching_rect": [
            420.0,
            250.0,
            60.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-57",
          "maxclass": "message",
          "text": "q $1",
          "patching_rect": [
            500.0,
            250.0,
            40.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-58",
          "maxclass": "message",
          "text": "$1",
          "patching_rect": [
            520.0,
            250.0,
            40.0,
            20.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-59",
          "maxclass": "sig~",
          "patching_rect": [
            160.0,
            305.0,
            40.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-60",
          "maxclass": "sig~",
          "patching_rect": [
            160.0,
            340.0,
            40.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-61",
          "maxclass": "!-~",
          "text": "!-~ 1.",
          "patching_rect": [
            210.0,
            340.0,
            55.0,
            22.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-62",
          "maxclass": "comment",
          "text": "Audio I/O",
          "patching_rect": [
            20.0,
            90.0,
            80.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-63",
          "maxclass": "comment",
          "text": "Rhythm Gate",
          "patching_rect": [
            220.0,
            200.0,
            100.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-64",
          "maxclass": "comment",
          "text": "SVF Filter (LP out)",
          "patching_rect": [
            320.0,
            95.0,
            140.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-65",
          "maxclass": "comment",
          "text": "Delay + Feedback",
          "patching_rect": [
            430.0,
            95.0,
            140.0,
            18.0
          ]
        }
      },
      {
        "box": {
          "id": "obj-66",
          "maxclass": "comment",
          "text": "Wet/Dry Mix",
          "patching_rect": [
            710.0,
            95.0,
            100.0,
            18.0
          ]
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "obj-8",
            0
          ],
          "destination": [
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-11",
            0
          ],
          "destination": [
            "obj-12",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-14",
            0
          ],
          "destination": [
            "obj-15",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-17",
            0
          ],
          "destination": [
            "obj-18",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-20",
            0
          ],
          "destination": [
            "obj-21",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-23",
            0
          ],
          "destination": [
            "obj-24",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            0
          ],
          "destination": [
            "obj-27",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-8",
            0
          ],
          "destination": [
            "obj-54",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-11",
            0
          ],
          "destination": [
            "obj-55",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-23",
            0
          ],
          "destination": [
            "obj-59",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            0
          ],
          "destination": [
            "obj-60",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-60",
            0
          ],
          "destination": [
            "obj-61",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-14",
            0
          ],
          "destination": [
            "obj-56",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-17",
            0
          ],
          "destination": [
            "obj-57",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-20",
            0
          ],
          "destination": [
            "obj-58",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-54",
            0
          ],
          "destination": [
            "obj-32",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-32",
            0
          ],
          "destination": [
            "obj-33",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-33",
            0
          ],
          "destination": [
            "obj-34",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-34",
            0
          ],
          "destination": [
            "obj-35",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-55",
            0
          ],
          "destination": [
            "obj-35",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-55",
            0
          ],
          "destination": [
            "obj-36",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            0
          ],
          "destination": [
            "obj-37",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-36",
            0
          ],
          "destination": [
            "obj-37",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            0
          ],
          "destination": [
            "obj-28",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-4",
            0
          ],
          "destination": [
            "obj-29",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            0
          ],
          "destination": [
            "obj-30",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-4",
            0
          ],
          "destination": [
            "obj-31",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-37",
            0
          ],
          "destination": [
            "obj-30",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-37",
            0
          ],
          "destination": [
            "obj-31",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-30",
            0
          ],
          "destination": [
            "obj-38",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-31",
            0
          ],
          "destination": [
            "obj-39",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-56",
            0
          ],
          "destination": [
            "obj-38",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-56",
            0
          ],
          "destination": [
            "obj-39",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-57",
            0
          ],
          "destination": [
            "obj-38",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-57",
            0
          ],
          "destination": [
            "obj-39",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-38",
            0
          ],
          "destination": [
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-39",
            0
          ],
          "destination": [
            "obj-47",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-43",
            0
          ],
          "destination": [
            "obj-40",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-40",
            0
          ],
          "destination": [
            "obj-41",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-58",
            0
          ],
          "destination": [
            "obj-41",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-41",
            0
          ],
          "destination": [
            "obj-42",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            0
          ],
          "destination": [
            "obj-42",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-42",
            0
          ],
          "destination": [
            "obj-43",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-47",
            0
          ],
          "destination": [
            "obj-44",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-44",
            0
          ],
          "destination": [
            "obj-45",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-58",
            0
          ],
          "destination": [
            "obj-45",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-45",
            0
          ],
          "destination": [
            "obj-46",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            0
          ],
          "destination": [
            "obj-46",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-46",
            0
          ],
          "destination": [
            "obj-47",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-41",
            0
          ],
          "destination": [
            "obj-48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-45",
            0
          ],
          "destination": [
            "obj-49",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-60",
            0
          ],
          "destination": [
            "obj-48",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-60",
            0
          ],
          "destination": [
            "obj-49",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-28",
            0
          ],
          "destination": [
            "obj-50",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-29",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-61",
            0
          ],
          "destination": [
            "obj-50",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-61",
            0
          ],
          "destination": [
            "obj-51",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-48",
            0
          ],
          "destination": [
            "obj-52",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-50",
            0
          ],
          "destination": [
            "obj-52",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-49",
            0
          ],
          "destination": [
            "obj-53",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-51",
            0
          ],
          "destination": [
            "obj-53",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            0
          ],
          "destination": [
            "obj-5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-53",
            0
          ],
          "destination": [
            "obj-6",
            0
          ]
        }
      }
    ]
  }
}