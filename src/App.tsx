                            {t.registration_time || "-"}
                          </div>
                        </div>
                        <div style={detailRowStyle(isMobile)}>
                          <div style={detailLabelStyle(isMobile)}>Beginn:</div>
                          <div style={detailValueStyle(isMobile)}>{t.start_time || "-"}</div>
                        </div>
                        <div style={detailRowStyle(isMobile)}>
                          <div style={detailLabelStyle(isMobile)}>Ausrichter:</div>
                          <div style={detailValueStyle(isMobile)}>{t.organizer || "-"}</div>
                        </div>
                        <div style={detailRowStyle(isMobile)}>
                          <div style={detailLabelStyle(isMobile)}>Ort:</div>
                          <div style={detailValueStyle(isMobile)}>{t.location || "-"}</div>
                        </div>
                        <div style={detailRowStyle(isMobile)}>
                          <div style={detailLabelStyle(isMobile)}>Mannschaft:</div>
                          <div style={detailValueStyle(isMobile)}>{t.team_name || "-"}</div>
                        </div>
                        <div style={detailRowStyle(isMobile)}>
                          <div style={detailLabelStyle(isMobile)}>Turnierart:</div>
                          <div style={detailValueStyle(isMobile)}>
                            {t.tournamentType || "-"}
                          </div>
                        </div>
                        <div style={detailRowStyle(isMobile)}>
                          <div style={detailLabelStyle(isMobile)}>Pässe:</div>
                          <div style={detailValueStyle(isMobile)}>{t.has_passes || "-"}</div>
                        </div>
                        <div style={{ ...detailRowStyle(isMobile), borderBottom: "none" }}>
                          <div style={detailLabelStyle(isMobile)}>Bemerkung:</div>
                          <div style={detailValueStyle(isMobile)}>{t.notes || "-"}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          marginBottom: 18,
                          flexDirection: isMobile ? "column" : "row",
                        }}
                      >
                        <button
                          onClick={() => addTournamentToCalendar(t)}
                          style={mutedButton(isMobile, {
                            width: isMobile ? "100%" : "auto",
                          })}
                        >
                          📅 In Kalender übernehmen
                        </button>
                        <button
                          onClick={() => saveStatus("dabei")}
                          style={successButton(isMobile, {
                            width: isMobile ? "100%" : "auto",
                          })}
                        >
                          Ich bin dabei
                        </button>
                        <button
                          onClick={() => saveStatus("nicht dabei")}
                          style={warnButton(isMobile, {
                            width: isMobile ? "100%" : "auto",
                          })}
                        >
                          Ich bin nicht dabei
                        </button>
                        <button
                          onClick={deleteMyEntry}
                          style={dangerButton(isMobile, {
                            width: isMobile ? "100%" : "auto",
                          })}
                        >
                          Meldung löschen
                        </button>
                      </div>

                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          marginBottom: 10,
                          color: COLORS.blue,
                        }}
                      >
                        Teilnehmer
                      </div>

                      {activeEntries.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            width: "100%",
                            maxWidth: "100%",
                            minWidth: 0,
                            overflowX: "hidden",
                            boxSizing: "border-box",
                          }}
                        >
                          {activeEntries.map((e) => (
                            <ParticipantCard
                              key={e.id}
                              name={e.player_name}
                              passNumber={getPassNumberByPlayerName(e.player_name)}
                              status={e.status}
                            />
                          ))}
                        </div>
                      ) : (
                        <div style={emptyStateStyle()}>
                          Noch keine Teilnehmer vorhanden.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {tournaments.length === 0 ? (
              <div style={emptyStateStyle()}>Noch keine Turniere vorhanden.</div>
            ) : null}
          </div>
        </div>
      </div>
