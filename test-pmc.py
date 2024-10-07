from Bio import Entrez

# Replace with your email; NCBI requires it for access
Entrez.email = "sness@sness.net"

def search_pubmed_central(search_term, max_results=10):
    # Perform a search on PubMed Central for the given search term
    handle = Entrez.esearch(db="pmc", term=search_term, retmax=max_results)
    results = Entrez.read(handle)
    handle.close()
    
    # Get the list of PubMed Central IDs (PMCID)
    pmc_ids = results["IdList"]
    return pmc_ids

def main():
    search_term = input("Enter search term for PubMed Central: ")
    
    # Search PubMed Central and get the IDs of matching papers
    pmc_ids = search_pubmed_central(search_term)
    
    if not pmc_ids:
        print("No papers found for the given search term.")
        return
    
    # Print out the PMC number for each paper
    print(f"\nPMC numbers for papers matching '{search_term}':")
    for pmc_id in pmc_ids:
        print(f"PMC{pmc_id}")

if __name__ == "__main__":
    main()

    
