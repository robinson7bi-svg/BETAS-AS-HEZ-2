/* =========================================================
   BETA AS HEZ
   CALENDAR & APPOINTMENT DATE SELECTION
   VERSION CORRIGÉE ET AMÉLIORÉE
   =========================================================

   RESPONSABILITÉS :

   - Générer automatiquement le calendrier
   - Afficher TOUS les jours du mois
   - Naviguer entre les mois
   - Identifier les jours disponibles
   - Identifier les jours indisponibles
   - Empêcher la sélection des jours passés
   - Sélectionner une date
   - Afficher les créneaux disponibles
   - Sélectionner une heure
   - Sauvegarder la réservation
   - Restaurer la réservation après actualisation
   - Préparer la connexion au futur backend
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

// URL du futur serveur
// Actuellement non utilisée.
const API_BASE_URL = "https://your-server.com/api";

// Page suivante
const DETAILS_PAGE = "bookappointment2.html";

// Date actuelle
let currentDate = new Date();

// Date sélectionnée
let selectedDate = null;

// Heure sélectionnée
let selectedTime = null;


/* =========================================================
   2. SERVICES
   ========================================================= */

const SERVICES = {

    structural: {
        name: "Structural Assessment",
        duration: 120
    },

    civil: {
        name: "Civil Planning",
        duration: 60
    }

};


/* =========================================================
   3. DONNÉES TEMPORAIRES
   =========================================================

   IMPORTANT :

   Cette partie simule actuellement ton serveur.

   Format :

   "YYYY-MM-DD": [
       "09:00",
       "10:00",
       "14:00"
   ]

   Une fois ton backend créé, cette partie pourra
   être remplacée par un fetch().
   ========================================================= */

const MOCK_AVAILABILITY = {

    "2026-08-25": [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "14:00",
        "15:00"
    ],

    "2026-08-26": [
        "09:00",
        "10:00",
        "11:00",
        "13:00",
        "14:00"
    ],

    "2026-08-27": [],

    "2026-08-28": [
        "09:30",
        "10:30",
        "13:00",
        "15:00"
    ],

    "2026-09-01": [
        "09:00",
        "10:00",
        "11:00",
        "14:00"
    ],

    "2026-09-02": [
        "09:30",
        "10:30",
        "13:00",
        "14:00",
        "15:30"
    ],

    "2026-09-03": [],

    "2026-09-04": [
        "09:00",
        "10:00",
        "10:30"
    ]

};


/* =========================================================
   4. INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /*
       Récupération des éléments HTML
    */

    const calendarGrid =
        document.getElementById("calendar-grid");

    const calendarMonth =
        document.getElementById("calendar-month");

    const previousMonthButton =
        document.getElementById("previous-month");

    const nextMonthButton =
        document.getElementById("next-month");

    const timeSlotsContainer =
        document.getElementById("time-slots");

    const selectedDateLabel =
        document.getElementById("selected-date-label");

    const continueButton =
        document.getElementById("continue-to-details");


    /*
       Vérification
    */

    if (!calendarGrid) {

        console.error(
            "BETA AS HEZ: #calendar-grid est introuvable."
        );

        return;
    }


    /* =====================================================
       RESTAURER LA RÉSERVATION
       ===================================================== */

    loadSavedBooking();


    /*
       Si une date était sauvegardée,
       afficher directement son mois.
    */

    if (selectedDate) {

        const savedDate =
            new Date(selectedDate + "T00:00:00");

        currentDate =
            new Date(
                savedDate.getFullYear(),
                savedDate.getMonth(),
                1
            );
    }


    /* =====================================================
       AFFICHER LE CALENDRIER
       ===================================================== */

    renderCalendar();


    /* =====================================================
       AFFICHER LES HORAIRES
       ===================================================== */

    if (selectedDate) {

        updateSelectedDateLabel();

        loadAvailableTimes(selectedDate);
    }


    /* =====================================================
       NAVIGATION MOIS PRÉCÉDENT
       ===================================================== */

    if (previousMonthButton) {

        previousMonthButton.addEventListener(
            "click",
            () => {

                currentDate.setMonth(
                    currentDate.getMonth() - 1
                );

                renderCalendar();

            }
        );
    }


    /* =====================================================
       NAVIGATION MOIS SUIVANT
       ===================================================== */

    if (nextMonthButton) {

        nextMonthButton.addEventListener(
            "click",
            () => {

                currentDate.setMonth(
                    currentDate.getMonth() + 1
                );

                renderCalendar();

            }
        );
    }


    /* =====================================================
       BOUTON CONTINUER
       ===================================================== */

    if (continueButton) {

        continueButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                if (!selectedDate) {

                    alert(
                        "Veuillez sélectionner une date."
                    );

                    return;
                }


                if (!selectedTime) {

                    alert(
                        "Veuillez sélectionner une heure."
                    );

                    return;
                }


                /*
                   Tout est valide.

                   Les informations sont déjà
                   sauvegardées dans sessionStorage.
                */

                window.location.href =
                    DETAILS_PAGE;

            }
        );
    }

});


/* =========================================================
   5. OUTILS DE DATE
   ========================================================= */


/*
   Convertit :

   Date JavaScript

   vers :

   YYYY-MM-DD
*/

function formatDateForStorage(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


/*
   Convertit :

   2026-08-25

   vers :

   mardi 25 août 2026
*/

function formatDateForDisplay(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "fr-FR",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


/*
   Retourne la date d'aujourd'hui
   au format YYYY-MM-DD.
*/

function getTodayString() {

    return formatDateForStorage(
        new Date()
    );
}


/* =========================================================
   6. SERVICE SÉLECTIONNÉ
   ========================================================= */

function getSelectedService() {

    const selectedService =
        document.querySelector(
            'input[name="service"]:checked'
        );


    /*
       Si aucun service n'est trouvé,
       utiliser structural par défaut.
    */

    if (!selectedService) {

        return "structural";
    }


    /*
       Vérifier que le service existe réellement.
    */

    if (!SERVICES[selectedService.value]) {

        return "structural";
    }


    return selectedService.value;
}


/*
   Durée du service.
*/

function getServiceDuration() {

    const service =
        getSelectedService();


    return (
        SERVICES[service]?.duration || 60
    );
}


/* =========================================================
   7. DISPONIBILITÉ
   ========================================================= */

function isDateAvailable(dateString) {

    return (
        Array.isArray(
            MOCK_AVAILABILITY[dateString]
        ) &&
        MOCK_AVAILABILITY[dateString].length > 0
    );
}


/*
   Vérifier si une date est passée.
*/

function isPastDate(dateString) {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date < today;
}


/* =========================================================
   8. GÉNÉRATION DU CALENDRIER
   ========================================================= */

function renderCalendar() {

    const calendarGrid =
        document.getElementById(
            "calendar-grid"
        );

    const calendarMonth =
        document.getElementById(
            "calendar-month"
        );


    if (!calendarGrid) {

        console.error(
            "Element #calendar-grid not found."
        );

        return;
    }


    /*
       Nettoyer le calendrier
    */

    calendarGrid.innerHTML = "";


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    /* =====================================================
       NOM DU MOIS
       ===================================================== */

    if (calendarMonth) {

        calendarMonth.textContent =
            currentDate.toLocaleDateString(
                "fr-FR",
                {
                    month: "long",
                    year: "numeric"
                }
            );
    }


    /* =====================================================
       PREMIER JOUR DU MOIS
       ===================================================== */

    const firstDay =
        new Date(
            year,
            month,
            1
        );


    /* =====================================================
       DERNIER JOUR DU MOIS
       ===================================================== */

    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );


    /* =====================================================
       POSITION DU PREMIER JOUR
       =====================================================

       JavaScript :

       dimanche = 0
       lundi    = 1
       mardi    = 2
       ...

       Notre calendrier commence lundi.

       Donc :

       dimanche → 6
       lundi    → 0
       mardi    → 1
       ...
    */

    let startingDay =
        firstDay.getDay();


    startingDay =
        startingDay === 0
            ? 6
            : startingDay - 1;


    /* =====================================================
       CASES VIDES
       ===================================================== */

    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        const emptyCell =
            document.createElement(
                "div"
            );


        emptyCell.className =
            "aspect-square";


        calendarGrid.appendChild(
            emptyCell
        );
    }


    /* =====================================================
       GÉNÉRER TOUS LES JOURS
       ===================================================== */

    for (
        let day = 1;
        day <= lastDay.getDate();
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateString =
            formatDateForStorage(
                date
            );


        const available =
            isDateAvailable(
                dateString
            );


        const past =
            isPastDate(
                dateString
            );


        const isToday =
            dateString ===
            getTodayString();


        /* =================================================
           CRÉATION DU BOUTON
           ================================================= */

        const dayButton =
            document.createElement(
                "button"
            );


        dayButton.type =
            "button";


        dayButton.textContent =
            day;


        /*
           Style de base.

           IMPORTANT :
           aucune opacité faible ici.
        */

        dayButton.className =
            "aspect-square " +
            "flex items-center justify-center " +
            "font-body-md text-body-md " +
            "rounded-lg " +
            "transition-all duration-150 " +
            "relative";


        /* =================================================
           DATE PASSÉE
           ================================================= */

        if (past) {

            dayButton.disabled =
                true;


            dayButton.classList.add(
                "text-steel",
                "bg-surface-container-low",
                "opacity-60",
                "cursor-not-allowed"
            );

        }


        /* =================================================
           DATE DISPONIBLE
           ================================================= */

        else if (available) {

            dayButton.classList.add(
                "text-midnight",
                "font-bold",
                "bg-surface-container-lowest",
                "border",
                "border-steel/20",
                "hover:bg-construction-orange",
                "hover:text-white",
                "hover:border-construction-orange",
                "hover:scale-105",
                "cursor-pointer"
            );


            dayButton.addEventListener(
                "click",
                () => {

                    selectDate(
                        dateString
                    );

                }
            );

        }


        /* =================================================
           DATE FUTURE MAIS INDISPONIBLE
           ================================================= */

        else {

            dayButton.disabled =
                true;


            dayButton.classList.add(
                "text-steel",
                "font-semibold",
                "bg-surface-container-low",
                "border",
                "border-transparent",
                "opacity-75",
                "cursor-not-allowed"
            );

        }


        /* =================================================
           AUJOURD'HUI
           ================================================= */

        if (isToday && !past) {

            dayButton.classList.add(
                "ring-2",
                "ring-construction-orange",
                "ring-offset-1"
            );
        }


        /* =================================================
           DATE SÉLECTIONNÉE
           ================================================= */

        if (
            dateString === selectedDate
        ) {

            setSelectedDateStyle(
                dayButton
            );
        }


        /* =================================================
           AJOUT AU CALENDRIER
           ================================================= */

        calendarGrid.appendChild(
            dayButton
        );
    }
}


/* =========================================================
   9. SÉLECTION D'UNE DATE
   ========================================================= */

async function selectDate(dateString) {

    /*
       Vérification de sécurité
    */

    if (isPastDate(dateString)) {

        return;
    }


    if (!isDateAvailable(dateString)) {

        return;
    }


    /*
       Sauvegarder la date
    */

    selectedDate =
        dateString;


    /*
       Nouvelle date =
       ancienne heure supprimée
    */

    selectedTime =
        null;


    /*
       Sauvegarder
    */

    sessionStorage.setItem(
        "selectedDate",
        selectedDate
    );


    sessionStorage.removeItem(
        "selectedTime"
    );


    /*
       Rafraîchir le calendrier
    */

    renderCalendar();


    /*
       Mettre à jour le texte
    */

    updateSelectedDateLabel();


    /*
       Charger les horaires
    */

    await loadAvailableTimes(
        dateString
    );
}


/* =========================================================
   10. STYLE DATE SÉLECTIONNÉE
   ========================================================= */

function setSelectedDateStyle(button) {

    /*
       Retirer les anciens styles
    */

    button.classList.remove(
        "text-midnight",
        "bg-surface-container-lowest",
        "bg-surface-container-low",
        "border-steel/20"
    );


    /*
       Ajouter le style sélectionné
    */

    button.classList.add(
        "bg-midnight",
        "text-white",
        "border-midnight",
        "font-bold",
        "shadow-[0px_2px_8px_rgba(15,23,42,0.18)]",
        "scale-105"
    );
}


/* =========================================================
   11. LABEL DATE SÉLECTIONNÉE
   ========================================================= */

function updateSelectedDateLabel() {

    const selectedDateLabel =
        document.getElementById(
            "selected-date-label"
        );


    if (!selectedDateLabel) {

        return;
    }


    if (!selectedDate) {

        selectedDateLabel.textContent =
            "Select a date to see available times.";

        return;
    }


    selectedDateLabel.textContent =
        `Créneaux disponibles pour ${formatDateForDisplay(selectedDate)}`;
}


/* =========================================================
   12. RÉCUPÉRER LES DISPONIBILITÉS
   ========================================================= */

async function getAvailability(
    dateString
) {

    /*
       ==================================================
       VERSION TEMPORAIRE
       ==================================================
    */

    return (
        MOCK_AVAILABILITY[
            dateString
        ] || []
    );


    /*
       ==================================================
       VERSION SERVEUR — PLUS TARD
       ==================================================

       const response = await fetch(
           `${API_BASE_URL}/availability?date=${dateString}`
       );

       if (!response.ok) {
           throw new Error(
               "Unable to retrieve availability."
           );
       }

       return await response.json();

       ==================================================
    */
}


/* =========================================================
   13. CHARGER LES HORAIRES
   ========================================================= */

async function loadAvailableTimes(
    dateString
) {

    const timeSlotsContainer =
        document.getElementById(
            "time-slots"
        );


    if (!timeSlotsContainer) {

        console.warn(
            "Element #time-slots not found."
        );

        return;
    }


    /*
       Loading
    */

    timeSlotsContainer.innerHTML = `
        <p class="text-steel text-center py-4">
            Chargement des créneaux disponibles...
        </p>
    `;


    try {

        const availableTimes =
            await getAvailability(
                dateString
            );


        /*
           Trier les heures
        */

        availableTimes.sort();


        /*
           Nettoyer
        */

        timeSlotsContainer.innerHTML =
            "";


        /*
           Aucun créneau
        */

        if (
            availableTimes.length === 0
        ) {

            timeSlotsContainer.innerHTML = `
                <div class="bg-surface-container-low
                            border border-steel/10
                            rounded-lg
                            p-md
                            text-center">

                    <p class="text-steel">
                        Aucun créneau disponible pour cette date.
                    </p>

                </div>
            `;

            return;
        }


        /*
           Matin
        */

        const morning =
            availableTimes.filter(
                time =>
                    time < "12:00"
            );


        /*
           Après-midi
        */

        const afternoon =
            availableTimes.filter(
                time =>
                    time >= "12:00"
            );


        /*
           Création des sections
        */

        if (
            morning.length > 0
        ) {

            createTimeSection(
                "Matin",
                morning
            );
        }


        if (
            afternoon.length > 0
        ) {

            createTimeSection(
                "Après-midi",
                afternoon
            );
        }

    }

    catch (error) {

        console.error(
            "Availability error:",
            error
        );


        timeSlotsContainer.innerHTML = `
            <div class="bg-error-container
                        border border-error
                        rounded-lg
                        p-md">

                <p class="text-error">
                    Impossible de charger les créneaux.
                    Veuillez réessayer.
                </p>

            </div>
        `;
    }
}


/* =========================================================
   14. CRÉER UNE SECTION D'HORAIRES
   ========================================================= */

function createTimeSection(
    title,
    times
) {

    const timeSlotsContainer =
        document.getElementById(
            "time-slots"
        );


    if (!timeSlotsContainer) {

        return;
    }


    /*
       Titre
    */

    const titleElement =
        document.createElement(
            "span"
        );


    titleElement.className =
        "font-label-sm " +
        "text-label-sm " +
        "text-steel " +
        "uppercase " +
        "tracking-wider " +
        "mt-4 mb-2 block";


    titleElement.textContent =
        title;


    timeSlotsContainer.appendChild(
        titleElement
    );


    /*
       Grille
    */

    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "grid grid-cols-2 md:grid-cols-3 gap-sm";


    /*
       Créer les boutons
    */

    times.forEach(
        time => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.textContent =
                formatTimeForDisplay(
                    time
                );


            /*
               Style normal
            */

            button.className =
                "flex items-center justify-center " +
                "w-full py-3 " +
                "border border-steel/30 " +
                "rounded-lg " +
                "font-body-md text-body-md " +
                "font-semibold " +
                "text-midnight " +
                "bg-off-white " +
                "hover:border-midnight " +
                "hover:bg-surface-container-high " +
                "transition-all duration-150 " +
                "cursor-pointer";


            /*
               Heure sélectionnée
            */

            if (
                time === selectedTime
            ) {

                button.classList.remove(
                    "bg-off-white"
                );


                button.classList.add(
                    "bg-midnight",
                    "text-white",
                    "border-midnight",
                    "shadow-[0px_2px_8px_rgba(15,23,42,0.18)]"
                );
            }


            /*
               Sélection
            */

            button.addEventListener(
                "click",
                () => {

                    selectTime(
                        time
                    );
                }
            );


            grid.appendChild(
                button
            );
        }
    );


    timeSlotsContainer.appendChild(
        grid
    );
}


/* =========================================================
   15. FORMATAGE DE L'HEURE
   ========================================================= */

function formatTimeForDisplay(
    time
) {

    const [
        hours,
        minutes
    ] = time.split(":");


    let hour =
        parseInt(
            hours,
            10
        );


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return (
        `${String(hour).padStart(2, "0")}:${minutes} ${period}`
    );
}


/* =========================================================
   16. SÉLECTION DE L'HEURE
   ========================================================= */

function selectTime(
    time
) {

    /*
       Une date doit être sélectionnée
       avant l'heure.
    */

    if (!selectedDate) {

        alert(
            "Veuillez d'abord sélectionner une date."
        );

        return;
    }


    /*
       Vérifier que l'heure existe réellement
       pour cette date.
    */

    const availableTimes =
        MOCK_AVAILABILITY[
            selectedDate
        ] || [];


    if (
        !availableTimes.includes(time)
    ) {

        console.warn(
            "Selected time is not available."
        );

        return;
    }


    /*
       Sauvegarder
    */

    selectedTime =
        time;


    sessionStorage.setItem(
        "selectedTime",
        selectedTime
    );


    /*
       Rafraîchir l'affichage
    */

    loadAvailableTimes(
        selectedDate
    );
}


/* =========================================================
   17. CHARGER UNE RÉSERVATION EXISTANTE
   ========================================================= */

function loadSavedBooking() {

    const savedDate =
        sessionStorage.getItem(
            "selectedDate"
        );


    const savedTime =
        sessionStorage.getItem(
            "selectedTime"
        );


    /*
       Restaurer la date
    */

    if (savedDate) {

        selectedDate =
            savedDate;
    }


    /*
       Restaurer l'heure
    */

    if (savedTime) {

        selectedTime =
            savedTime;
    }


    /*
       Vérifier que la date sauvegardée
       possède toujours des créneaux.
    */

    if (
        selectedDate &&
        !isDateAvailable(selectedDate)
    ) {

        selectedTime =
            null;


        sessionStorage.removeItem(
            "selectedTime"
        );
    }
}


/* =========================================================
   18. VALIDATION
   ========================================================= */

function validateBooking() {

    if (!selectedDate) {

        alert(
            "Veuillez sélectionner une date."
        );

        return false;
    }


    if (!selectedTime) {

        alert(
            "Veuillez sélectionner une heure."
        );

        return false;
    }


    return true;
}
/* =========================================================
   19. BOUTON CONTINUE
   ========================================================= */
document.addEventListener(
    "DOMContentLoaded",
    () => {

        const continueButton =
            document.getElementById(
                "continue-to-details"
            );


        if (!continueButton) {

            return;
        }


        continueButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (
                    !validateBooking()
                ) {

                    return;
                }


                /*
                   Sauvegarder une dernière fois
                */

                sessionStorage.setItem(
                    "selectedDate",
                    selectedDate
                );


                sessionStorage.setItem(
                    "selectedTime",
                    selectedTime
                );


                /*
                   Aller à la page Details
                */

                window.location.href =
                    DETAILS_PAGE;

            }
        );
    }
);


/* =========================================================
   20. DEBUG
   =========================================================

   Dans la console :

   calendarState()

   ========================================================= */

function calendarState() {

    return {

        service:
            getSelectedService(),

        serviceName:
            SERVICES[
                getSelectedService()
            ]?.name,

        date:
            selectedDate,

        dateFormatted:
            selectedDate
                ? formatDateForDisplay(
                    selectedDate
                )
                : null,

        time:
            selectedTime,

        duration:
            getServiceDuration()

    };
}


window.calendarState =
    calendarState;


/* =========================================================
   FIN DU SCRIPT
   ========================================================= */