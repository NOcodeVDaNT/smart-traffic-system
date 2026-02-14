def calculate_green_time(predicted_traffic,
                         total_green_time=60,
                         gmin=10,
                         gmax=45):

    # Phase traffic
    ns_traffic = predicted_traffic["north"] + predicted_traffic["south"]
    ew_traffic = predicted_traffic["east"] + predicted_traffic["west"]

    total_traffic = ns_traffic + ew_traffic

    # If no traffic → equal split
    if total_traffic == 0:
        return {
            "phase_NS": total_green_time // 2,
            "phase_EW": total_green_time // 2
        }

    # Step 1: Reserve minimum time
    remaining_time = total_green_time - (2 * gmin)

    # Step 2: Proportional distribution of remaining time
    green_ns = gmin + (ns_traffic / total_traffic) * remaining_time
    green_ew = gmin + (ew_traffic / total_traffic) * remaining_time

    # Step 3: Apply gmax constraint
    green_ns = min(green_ns, gmax)
    green_ew = min(green_ew, gmax)

    # Step 4: If one phase hits gmax, adjust the other to preserve total
    total_assigned = green_ns + green_ew

    if total_assigned != total_green_time:
        difference = total_green_time - total_assigned

        # Add remaining time to the phase that is not at gmax
        if green_ns < gmax:
            green_ns += difference
        else:
            green_ew += difference

    return {
        "phase_NS": round(green_ns),
        "phase_EW": round(green_ew)
    }
